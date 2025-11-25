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

#### A. Update Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `https://guidelight.xylent.studio`
3. Add to **Redirect URLs**:
   - `https://guidelight.xylent.studio`
   - `https://guidelight.xylent.studio/**`
   - `http://localhost:5173` (for local dev)
   - `http://localhost:5173/**` (for local dev)

#### B. Verify Edge Functions

All three Edge Functions should be deployed and ACTIVE:
- ✅ `invite-staff` (v6)
- ✅ `get-staff-with-status` (v1)
- ✅ `reset-staff-password` (v1)

Verify in: Supabase Dashboard → Edge Functions

#### C. Email Configuration

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Verify email sender: `xylent.studio@gmail.com`
3. Default templates are being used (can customize later)

#### D. Database Migration

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

### Issue: Redirect Loop After Login
**Solution:** Verify Site URL in Supabase matches production domain exactly

### Issue: Edge Functions Return 401
**Solution:** Check that `verify_jwt` is enabled and user is authenticated

### Issue: Emails Not Sending
**Solution:** 
- Verify email configuration in Supabase Dashboard
- Check spam folder
- Verify rate limits haven't been hit

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
**Version:** 1.0.0

