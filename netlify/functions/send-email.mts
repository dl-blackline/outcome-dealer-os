/**
 * Netlify Function: send-email
 *
 * Accepts a POST with a JSON body describing the email to send,
 * then calls the SendGrid Web API to deliver it.
 *
 * The SENDGRID_API_KEY is a server-side env var — it is NEVER
 * exposed to the browser bundle.
 *
 * Allowed origins are restricted to the VITE_PUBLIC_URL var (or
 * a known localhost for local dev), preventing open-relay abuse.
 *
 * Body schema:
 * {
 *   type: 'inquiry' | 'appointment' | 'quick_app' | 'trade_in'
 *   to?: string          // optional override; defaults to dealer email
 *   subject?: string     // optional override
 *   fields: Record<string, string | undefined>  // template variables
 * }
 */

import type { Context } from '@netlify/functions'

const SENDGRID_API = 'https://api.sendgrid.com/v3/mail/send'
const DEALER_EMAIL = 'dl@blacklinecrm.com'
const DEALER_NAME = 'National Car Mart — Vehicle Vault'
const FROM_EMAIL = 'noreply@blacklinecrm.com' // must be verified in SendGrid

const SUBJECTS: Record<string, string> = {
  inquiry: '🔔 New Vehicle Inquiry Received',
  appointment: '📅 New Appointment Request',
  quick_app: '📋 New Credit Application Submitted',
  trade_in: '🔄 New Trade-In Appraisal Request',
}

function buildHtmlBody(type: string, fields: Record<string, string | undefined>): string {
  const rows = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:13px;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:14px">${escapeHtml(String(v))}</td></tr>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;padding:32px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="background:#0f172a;padding:24px 32px">
      <p style="color:#7dd3fc;font-size:11px;margin:0;letter-spacing:0.2em;text-transform:uppercase">${escapeHtml(DEALER_NAME)}</p>
      <h1 style="color:#fff;font-size:22px;margin:8px 0 0">${escapeHtml(SUBJECTS[type] ?? 'New Submission')}</h1>
    </div>
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e5e5;font-size:12px;color:#aaa">
      Sent automatically by Vehicle Vault OS &mdash; do not reply to this email.
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function getAllowedOrigins(): string[] {
  const publicUrl = process.env['URL'] ?? ''
  return [
    publicUrl,
    'http://localhost:5173',
    'http://localhost:4173',
  ].filter(Boolean)
}

export default async function handler(req: Request, _ctx: Context): Promise<Response> {
  // CORS pre-flight
  const origin = req.headers.get('origin') ?? ''
  const allowed = getAllowedOrigins()
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (allowed.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const apiKey = process.env['SENDGRID_API_KEY']
  if (!apiKey) {
    // Gracefully degrade — log server-side, return 200 so forms still complete
    console.warn('[send-email] SENDGRID_API_KEY not set; email skipped')
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  let body: { type?: string; to?: string; subject?: string; fields?: Record<string, string | undefined> }
  try {
    body = await req.json() as typeof body
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const { type = 'inquiry', to, subject, fields = {} } = body

  // Sanitise: only allow known types to prevent subject injection
  if (!Object.keys(SUBJECTS).includes(type)) {
    return new Response(JSON.stringify({ error: 'Unknown email type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const toAddress = to ?? DEALER_EMAIL
  // Basic email format guard (belt-and-suspenders; not a full RFC check)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toAddress)) {
    return new Response(JSON.stringify({ error: 'Invalid recipient address' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const payload = {
    personalizations: [{ to: [{ email: toAddress }] }],
    from: { email: FROM_EMAIL, name: DEALER_NAME },
    subject: subject ?? SUBJECTS[type],
    content: [{ type: 'text/html', value: buildHtmlBody(type, fields) }],
  }

  let sgRes: Response
  try {
    sgRes = await fetch(SENDGRID_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[send-email] SendGrid fetch failed:', err)
    return new Response(JSON.stringify({ ok: false, error: 'Email delivery failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  if (!sgRes.ok) {
    const detail = await sgRes.text()
    console.error('[send-email] SendGrid error:', sgRes.status, detail)
    return new Response(JSON.stringify({ ok: false, error: 'Email delivery failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

export const config = { path: '/api/send-email' }
