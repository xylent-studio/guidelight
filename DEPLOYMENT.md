# Guidelight Deployment Guide

## Overview

This guide covers deploying Guidelight to Netlify with Supabase backend.

**Production URL:** `https://guidelight.xylent.studio`
**Supabase Project:** Xylent Studios organization
**Email Sender:** `xylent.studio@gmail.com`

---

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure these are set in your `.env.local` for local development and in Netlify for production:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Netlify Setup:**
1. Go to your Netlify site settings
2. Navigate to "Site settings" → "Environment variables"
3. Add both variables above

### 2. Supabase Configuration

#### A. Update URL Configuration (CRITICAL for Invites)

**This is essential for invite emails to work correctly.**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `https://guidelight.xylent.studio`
   - ⚠️ This is where invite/reset links will redirect to
   - Must match your production domain exactly
3. Add to **Redirect URLs**:
   - `https://guidelight.xylent.studio`
   - `https://guidelight.xylent.studio/**`
   - `http://localhost:5173` (for local dev)
   - `http://localhost:5173/**` (for local dev)

**How Invite Flow Works:**
1. Manager clicks "Invite Staff" → Edge Function creates auth user + sends email
2. New user clicks email link → Supabase redirects to `Site URL` with `#type=invite&access_token=...`
3. App detects `type=invite` → Shows password setup page
4. User sets password → Redirected to main app

**Important:** When testing locally, temporarily change Site URL to `http://localhost:5173` or invite links will redirect to production.

#### B. Password Security Settings

1. Go to Supabase Dashboard → Authentication → Providers → Email
2. Set **Minimum password length** to: `6` (minimum allowed)
3. Leave other settings at defaults for MVP
4. ⚠️ Do NOT enable "Leaked password protection" (Pro plan feature)

**Note:** Password requirements are enforced both client-side (6 char minimum) and server-side by Supabase.

#### B. Verify Edge Functions

All three Edge Functions should be deployed and ACTIVE:
- ✅ `invite-staff` (v6)
- ✅ `get-staff-with-status` (v1)
- ✅ `reset-staff-password` (v1)

Verify in: Supabase Dashboard → Edge Functions

#### C. Email Configuration

1. Go to Supabase Dashboard → Project Settings → Authentication
2. Under "SMTP Settings", verify:
   - **Sender email:** `xylent.studio@gmail.com`
   - **Sender name:** `Guidelight` (or your preferred name)

**Testing Emails:**
- Invite emails come from Supabase's default sender unless custom SMTP is configured
- Check spam folder if emails don't arrive
- Rate limit: 4 emails per hour per recipient (Supabase default)

#### D. Email Templates (Guidelight-branded)

**Template Files Location:** `supabase/templates/`

The project includes custom Guidelight-branded email templates:
- `invite.html` / `invite.txt` - Staff invite email
- `recovery.html` / `recovery.txt` - Password reset email
- `magic_link.html` - Magic link login email
- `confirmation.html` - Email confirmation email

**Template Variables (Go template syntax):**
- `{{ .ConfirmationURL }}` - Full action URL (invite/reset/confirm link)
- `{{ .SiteURL }}` - Your Site URL (set in URL Configuration)
- `{{ .Token }}` - 6-digit OTP (alternative to link)
- `{{ .Data.name }}` - User's name from metadata (if available)
- `{{ .Email }}` - User's email address

**Syncing Templates to Hosted Supabase (Dashboard Method):**

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Select each template type and update:

   **Invite User Template:**
   - Subject: `Your Guidelight invite from State of Mind`
   - Body: Copy content from `supabase/templates/invite.html`

   **Reset Password Template:**
   - Subject: `Reset your Guidelight password`
   - Body: Copy content from `supabase/templates/recovery.html`

   **Magic Link Template:**
   - Subject: `Your Guidelight login link`
   - Body: Copy content from `supabase/templates/magic_link.html`

   **Confirm Signup Template:**
   - Subject: `Confirm your Guidelight account`
   - Body: Copy content from `supabase/templates/confirmation.html`

3. Click "Save" for each template

**Syncing Templates via Management API (Automated Method):**

```bash
# Get your access token from https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="your-access-token"
export PROJECT_REF="your-project-ref"

# Update invite email template
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_invite": "Your Guidelight invite from State of Mind",
    "mailer_templates_invite_content": "<html>... (paste HTML content) ...</html>",
    "mailer_subjects_recovery": "Reset your Guidelight password",
    "mailer_templates_recovery_content": "<html>... (paste HTML content) ...</html>"
  }'
```

**Local Development:**

For local development with `supabase start`, the templates are configured in `supabase/config.toml`. Run:
```bash
supabase stop && supabase start
```
to apply template changes locally.

**Verifying Template Updates:**

1. Trigger a test invite (Staff Management → Invite Staff)
2. Check the email received matches the Guidelight branding
3. Verify links work and redirect correctly

#### E. Database Migration

Verify the `location` column exists in `budtenders` table:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'budtenders' AND column_name = 'location';
```

---

## Netlify Deployment

### Initial Setup

1. **Connect Repository**
   ```bash
   # Push latest changes to GitHub first
   git add .
   git commit -m "Production deployment preparation"
   git push origin main
   ```

2. **Create Netlify Site**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select `Xylent_Studios` repository
   - Select `02_projects/guidelight` as base directory

3. **Configure Build Settings**
   - **Base directory:** `02_projects/guidelight`
   - **Build command:** `npm run build`
   - **Publish directory:** `02_projects/guidelight/dist`
   - **Node version:** 20.19.0 or higher

4. **Set Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

5. **Configure Custom Domain**
   - Go to "Domain settings"
   - Add custom domain: `guidelight.xylent.studio`
   - Follow DNS configuration instructions for `xylent.studio`

### netlify.toml Configuration

Create a `netlify.toml` in the project root:

```toml
[build]
  base = "02_projects/guidelight"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20.19.0"
```

---

## Post-Deployment Testing

### 1. Test Authentication Flows

- [ ] Login with existing user
- [ ] Logout
- [ ] Forgot password → receive email → reset password
- [ ] Change password while logged in

### 2. Test Manager Features

- [ ] Invite new staff member
- [ ] Check invite email is received
- [ ] Accept invite → set password → login
- [ ] View staff with status badges (Pending, Active)
- [ ] Edit staff profile with location
- [ ] Manager-initiated password reset
- [ ] Verify self-deletion protection

### 3. Test Core Functionality

- [ ] Customer View loads with picks
- [ ] Staff View - create/edit/delete picks
- [ ] Staff Management View (manager only)
- [ ] Logout and login again

### 4. Test Edge Functions

Check Supabase Edge Function logs for any errors:
```
Supabase Dashboard → Edge Functions → [function-name] → Logs
```

---

## Rollback Procedure

If issues arise post-deployment:

1. **Immediate Rollback (Netlify)**
   - Go to Netlify Dashboard → Deploys
   - Find previous working deployment
   - Click "Publish deploy"

2. **Rollback Database Migration** (if needed)
   ```sql
   -- Remove location column if causing issues
   ALTER TABLE public.budtenders DROP COLUMN IF EXISTS location;
   ```

3. **Rollback Edge Functions** (if needed)
   - Deploy previous version from local files
   - Or temporarily disable via Supabase Dashboard

---

## Monitoring

### Check These After Deployment

1. **Browser Console**
   - No errors on page load
   - Auth flows complete without errors

2. **Supabase Dashboard**
   - Authentication → Users (verify new signups work)
   - Edge Functions → Logs (check for errors)
   - Database → Tables (verify data is correct)

3. **Email Delivery**
   - Test invite sends successfully
   - Test password reset sends successfully
   - Check spam folder if not received

---

## Common Issues

### Issue: Invite Links Redirect to Wrong URL
**Cause:** Site URL in Supabase doesn't match your deployment
**Solution:** 
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL to exactly: `https://guidelight.xylent.studio`
3. For local testing, temporarily change to `http://localhost:5173`

### Issue: User Clicks Invite But Doesn't See Password Setup
**Cause:** URL hash not being parsed correctly or localStorage has stale data
**Solution:**
1. Clear browser localStorage for the site
2. Ensure URL contains `#type=invite&access_token=...`
3. Check browser console for `[App] Auth flow detected: invite`

### Issue: Existing User Session Conflicts with Invite
**Cause:** Another user was logged in when invite link was clicked
**Solution:** This is handled automatically - Supabase replaces the existing session with the new invited user's session when the invite link is clicked. The new user will be prompted to set their password.

### Issue: Redirect Loop After Login
**Solution:** Verify Site URL in Supabase matches production domain exactly

### Issue: Edge Functions Return 401
**Solution:** Check that `verify_jwt` is enabled and user is authenticated

### Issue: Emails Not Sending
**Solution:** 
- Verify email configuration in Supabase Dashboard
- Check spam folder
- Verify rate limits haven't been hit (4/hour per recipient)
- Check Edge Function logs for errors

### Issue: Password Too Short Error
**Solution:** 
- Client enforces 6 character minimum
- Supabase default is 6 characters
- If error persists, check Supabase Dashboard → Auth → Providers → Email → Min password length

### Issue: Database Connection Errors
**Solution:** 
- Verify environment variables are set correctly in Netlify
- Check Supabase project status
- Verify database policies allow access

---

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use environment variables** for all secrets
3. **RLS policies** protect data at database level
4. **Edge Functions** verify JWT tokens for manager actions
5. **Generic error messages** prevent user enumeration

---

## Support

For issues:
1. Check Supabase Edge Function logs
2. Check Netlify deploy logs
3. Check browser console for client errors
4. Review this deployment guide

---

**Last Updated:** 2025-11-25
**Version:** 1.1.0

