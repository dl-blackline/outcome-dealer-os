# Environment Variables Reference

## Required for Production

### Supabase (Public API)
```
VITE_SUPABASE_URL=https://fydbxxdibjxpwsyyigys.supabase.co
```
- **Purpose**: Client-side Supabase project URL
- **Status**: REQUIRED for auth, inventory, and data operations
- **Fallback**: If missing, app runs in demo mode with local-only auth

### Supabase (Anonymous Key)
```
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
- **Purpose**: Public anonymous key for unauthenticated Supabase access
- **Status**: REQUIRED for public inventory queries
- **Fallback**: If missing, Supabase client is disabled; inventory falls back to CSV seed data
- **Security**: Safe to expose (anonymous key with RLS policies)

### Supabase Storage Bucket
```
VITE_SUPABASE_STORAGE_BUCKET=vehicle-photos
```
- **Purpose**: Storage bucket name for vehicle photos
- **Status**: OPTIONAL (defaults to `vehicle-photos`)
- **Fallback**: Uses default value if omitted

### Database Connection (Server-side/Migrations Only)
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.fydbxxdibjxpwsyyigys.supabase.co:5432/postgres
```
- **Purpose**: Direct PostgreSQL connection for running migrations (0015 and seeding)
- **Status**: REQUIRED for database setup; not used in frontend
- **Security**: Keep secret, never expose in frontend code or public config
- **Usage**: `npm run migrate` or manual `psql` connections

---

## AI Features (DISABLED by Default)

### OpenAI API Key
```
VITE_OPENAI_API_KEY=
```
- **Purpose**: OpenAI integration for AI-powered features
- **Status**: DISABLED (leave blank)
- **Reason**: Not currently used in public UX; placeholder for future AI agent work
- **Action**: Keep empty or omit entirely

### AI Toggle
```
VITE_AI_ENABLED=false
```
- **Purpose**: Master switch to disable all AI calls
- **Status**: Set to `false` to prevent accidental OpenAI API calls
- **Safety**: If missing, defaults to `false` (safe-by-default)

### Anthropic API Key
```
VITE_ANTHROPIC_KEY=
```
- **Purpose**: Claude API integration (placeholder)
- **Status**: DISABLED (leave blank); not currently used
- **Action**: Keep empty or omit

---

## Optional / Build-time

### Vite Base URL
```
VITE_BASE_URL=/  # or /outcome-dealer-os/ if deploying to subpath
```
- **Purpose**: Base path for asset resolution and hash routing
- **Status**: OPTIONAL (Vite auto-detects for root)
- **Netlify**: Auto-detected; no action needed

### GitHub Pages Deploy
```
GITHUB_PAGES=true  # only if deploying to gh-pages
```
- **Purpose**: Switches base path to `/outcome-dealer-os/`
- **Status**: OPTIONAL (leave unset for standard deploys like Netlify)
- **Usage**: Only needed if publishing to https://github.com/dl-blackline/outcome-dealer-os/

---

## Setup Checklist

- [ ] Copy `.env.example` → `.env.local`
- [ ] Fill in `VITE_SUPABASE_ANON_KEY` from Supabase dashboard
- [ ] Fill in `DATABASE_URL` for migrations (keep in secure secrets; don't commit)
- [ ] Verify `VITE_AI_ENABLED=false` (leave AI keys blank)
- [ ] Test build: `npm run build` (should pass)
- [ ] Test dev: `npm run dev` (public pages should load)

---

## Fallback Behavior

| Component | Required Var | Fallback | Impact |
|-----------|--------------|----------|--------|
| Public Inventory | `VITE_SUPABASE_ANON_KEY` | CSV seed data | Works, uses demo inventory |
| Auth System | `VITE_SUPABASE_URL` + key | Demo mode | Works, local session only |
| Database Ops | `DATABASE_URL`  | N/A (backend only) | Migrations fail; requires manual connection |
| Photos | `VITE_SUPABASE_STORAGE_BUCKET` | `vehicle-photos` | Works with default bucket |
| AI Features | `VITE_OPENAI_API_KEY` | Disabled | No API calls; safe |

---

## Production Deployment (Netlify)

1. **Set via Netlify Admin > Build & Deploy > Environment**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Leave unset or set to empty**:
   - `VITE_OPENAI_API_KEY`
   - `VITE_ANTHROPIC_KEY`

3. **Set explicitly for safety**:
   - `VITE_AI_ENABLED=false`

4. **Do NOT expose in frontend**:
   - `DATABASE_URL` (server-side only; keep in CI/CD secrets)

---

## Validation

Run diagnostics to check env setup:

```bash
# Start dev server (will show setup summary)
npm run dev

# Check for missing/invalid env vars (shown in browser console)
# Look for messages about Supabase client initialization
```

If you see:
- ✅ "Supabase client initialized" → All good
- ⚠️ "Supabase not configured" → Check `VITE_SUPABASE_URL` + key
- ✅ "Demo mode active" → Fallback working (no Supabase needed for testing)
