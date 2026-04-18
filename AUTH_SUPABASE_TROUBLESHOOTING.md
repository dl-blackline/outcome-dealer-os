# Supabase Authentication Troubleshooting

## Issue: "Cannot read properties of null (reading 'id')"

This error occurs when the auth system tries to fetch user metadata from Supabase but the session data is null or improperly structured.

### Root Causes

1. **User not properly created in Supabase**
   - User exists in the database but doesn't have a valid auth session token
   - User was created but password wasn't set correctly

2. **Missing/incorrect env variables**
   - `VITE_SUPABASE_URL` not set
   - `VITE_SUPABASE_ANON_KEY` not set
   - Missing or expired anon key

3. **Session state mismatch**
   - Browser session doesn't match Supabase auth state
   - Stale localStorage from previous failed login

### Fix Applied

Updated [src/domains/auth/auth.service.ts](src/domains/auth/auth.service.ts) to add null-safe access to user data:

```typescript
// Before (line 101):
const metadataRole = String(data.user?.app_metadata?.role || data.user?.user_metadata?.role || '')

// After (now safe):
const metadataRole = String(data?.user?.app_metadata?.role || data?.user?.user_metadata?.role || '')
```

Also strengthened the null check at line 50:
```typescript
// Before:
if (error || !data.user) { ... }

// After:
if (error || !data?.user) { ... }
```

### Troubleshooting Steps

#### 1. **Clear browser session and try again**
```bash
# Open browser dev console and run:
localStorage.clear()
sessionStorage.clear()
# Reload the page
```

#### 2. **Verify Supabase Environment Variables**
Create `.env.local` with your actual Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

#### 3. **Verify User in Supabase Dashboard**

Go to **Authentication → Users** and check:

- ✅ User email is listed
- ✅ User has "Created" timestamp (not pending)
- ✅ Status shows "Active" (not blocked/unverified)

#### 4. **Create/Reset User via Supabase CLI**

If the user doesn't exist or is misconfigured:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Link to your project
supabase projects list
supabase link --project-ref YOUR_PROJECT_ID

# Create a new user with password
supabase auth admin create-user \
  --email manager@outcome.local \
  --password "password123" \
  --user-metadata '{"full_name":"Manager","role":"gm"}'
```

#### 5. **Check Browser Console for More Details**

In Dev Tools Console, add this to see what Supabase is returning:

```javascript
// In browser console
const { createClient } = supabase
const client = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
)
const { data, error } = await client.auth.getUser()
console.log('Auth User:', { data, error })
console.log('User exists?', !!data?.user)
console.log('Session?', !!data?.user?.id)
```

#### 6. **Fallback to Demo Mode**

If you want to bypass Supabase authentication temporarily:

Remove or rename `.env.local`:
```bash
rm .env.local
# Restart dev server
```

Then log in with demo credentials:
- Email: `manager@outcome.local`
- Password: `password123`
- Role: Choose from dropdown

This stores your session in localStorage (not Supabase) and works offline.

### Expected Behavior

**Login Flow:**
1. Enter email/password on login page
2. Supabase validates credentials
3. Session token stored in browser
4. App calls `auth.getUser()` to fetch current user
5. User metadata (role, name) loaded from user_metadata object
6. Authenticated user redirected to dashboard

**Error Messages if Something Goes Wrong:**
- ✗ "No active Supabase session" → User not logged in or session expired
- ✗ "Cannot read properties of null" → Fixed (was null-access bug)
- ✗ "Supabase not configured" → Missing env variables
- ✗ "Invalid credentials" → Wrong email/password

### Database User Record Structure

When creating a user in Supabase auth:

```json
{
  "id": "uuid-string",
  "email": "manager@outcome.local",
  "user_metadata": {
    "full_name": "Manager Name",
    "role": "gm",  ← This determines the app role
    "avatar_url": "https://..."
  },
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "created_at": "2024-04-18...",
  "confirmed_at": "2024-04-18..."
}
```

### Still Having Issues?

1. Try in an incognito/private browser window (fresh session)
2. Check that you're using the correct Supabase project (not staging/dev)
3. Verify the anon key hasn't been rotated recently
4. Check Supabase status page for any outages
5. Look at Supabase auth logs in the dashboard

---

**Build Status:** ✅ All changes compiled successfully
