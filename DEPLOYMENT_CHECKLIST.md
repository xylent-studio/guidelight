# Deployment Checklist for Guidelight v1.1.0

## Pre-Deployment (Complete These Before Deploying)

### ✅ Code & Build
- [x] All code committed to Git
- [x] Tagged as v1.0.0
- [x] Pushed to GitHub
- [x] Production build tested (`npm run build` - 0 errors)
- [x] Bundle size reviewed (577KB JS, 48KB CSS)

### 🔧 Supabase Configuration

#### [ ] Update Redirect URLs
1. Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Authentication → URL Configuration
2. Set **Site URL** to: `https://guidelight.xylent.studio`
3. Add to **Redirect URLs**:
   - `https://guidelight.xylent.studio`
   - `https://guidelight.xylent.studio/**`
   - Keep: `http://localhost:5173` (for local dev)
   - Keep: `http://localhost:5173/**` (for local dev)

#### [x] Verify Edge Functions are Deployed
- [x] `invite-staff` (v7) - ACTIVE ✅
- [x] `get-staff-with-status` (v2) - ACTIVE ✅
- [x] `reset-staff-password` (v1) - ACTIVE ✅

#### [ ] Check Email Configuration
1. Go to: Supabase Dashboard → Authentication → Email Templates
2. Verify sender: `xylent.studio@gmail.com`
3. (Optional) Customize email templates if needed

#### [x] Verify Database Migrations
- [x] `location` column exists in `budtenders` table
- [x] `rename_budtender_profile_fields` - Renamed `archetype`, `ideal_high`, `tolerance_level` to `profile_expertise`, `profile_vibe`, `profile_tolerance`
- [x] `add_picks_category_id_index` - Added index on `picks.category_id` for JOIN performance
- [x] `optimize_rls_policies_select_wrapper` - Optimized 12 RLS policies with `(SELECT auth.uid())` wrapper

---

## Netlify Deployment

### [ ] Initial Setup (First Time Only)

1. **Connect Repository**
   - Go to: [Netlify Dashboard](https://app.netlify.com)
   - Click: "Add new site" → "Import an existing project"
   - Connect to GitHub: `xylent-studio/guidelight`
   - Note: Use base directory path

2. **Configure Build Settings**
   ```
   Base directory: 02_projects/guidelight
   Build command: npm run build
   Publish directory: 02_projects/guidelight/dist
   ```

3. **Set Environment Variables**
   - Go to: Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL` = (your Supabase project URL)
     - `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)

4. **Configure Custom Domain**
   - Go to: Domain settings → Add custom domain
   - Enter: `guidelight.xylent.studio`
   - Follow DNS configuration for `xylent.studio`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2 minutes)

---

## Post-Deployment Testing

### [ ] Authentication Flows (Critical)
- [ ] Visit `https://guidelight.xylent.studio`
- [ ] Login with existing manager account
- [ ] Logout
- [ ] Click "Forgot your password?"
- [ ] Receive email and complete password reset
- [ ] Login again with new password
- [ ] Click "Change Password" in header
- [ ] Successfully change password

### [ ] Manager Features (Critical)
- [ ] Navigate to "Staff Management"
- [ ] Click "Invite Staff"
- [ ] Fill in form with test email (use a real email you can check)
- [ ] Submit invite
- [ ] Verify success message
- [ ] Check email inbox for invite (check spam folder)
- [ ] Click link in email
- [ ] Complete password setup on Accept Invite page
- [ ] Login with new account
- [ ] Logout
- [ ] Login as manager again
- [ ] Verify new user shows "Active" status badge
- [ ] Click "Reset Password" for the test user
- [ ] Verify email received

### [ ] Core Functionality (Important)
- [ ] Customer View loads correctly
- [ ] Staff View - create a new pick
- [ ] Staff View - edit existing pick
- [ ] Staff View - toggle pick active/inactive
- [ ] Verify changes persist after page refresh

### [ ] Staff Management (Important)
- [ ] View all staff with correct status badges
- [ ] Filter by status tabs (All, Active, Pending, Inactive)
- [ ] Edit staff profile with location
- [ ] Toggle staff active/inactive
- [ ] Verify self-deletion button is disabled
- [ ] Verify delete staff works (but DON'T delete real staff!)

### [ ] Edge Cases
- [ ] Try logging in with wrong password (should show generic error)
- [ ] Try accessing Staff Management as non-manager (should be blocked)
- [ ] Try accepting expired invite link (should show appropriate error)

---

## Monitoring (First 24 Hours)

### [ ] Check These Regularly

1. **Supabase Dashboard**
   - Edge Functions → Logs (look for errors)
   - Authentication → Users (verify new signups)
   - Database → Tables (spot check data)

2. **Netlify Dashboard**
   - Functions → Edge logs (if any issues)
   - Site analytics (traffic, errors)

3. **Email Delivery**
   - Test invite sends successfully
   - Check spam folder probability
   - Monitor delivery rate

4. **Browser Console**
   - Test in different browsers (Chrome, Firefox, Safari, Edge)
   - Check for JavaScript errors
   - Verify responsive design on mobile

---

## Rollback Plan (If Needed)

### Quick Rollback

1. **Netlify Rollback**
   - Go to: Netlify Dashboard → Deploys
   - Find previous working deployment
   - Click "Publish deploy"
   - Takes effect immediately

2. **Supabase Rollback** (if database issues)
   ```sql
   -- Remove location column if causing problems
   ALTER TABLE public.budtenders DROP COLUMN IF EXISTS location;
   ```

3. **Edge Functions Rollback**
   - Redeploy previous version from Git history
   - Or disable temporarily in Supabase Dashboard

---

## Success Criteria

✅ Deployment is successful when:
- [ ] All authentication flows work end-to-end
- [ ] Manager can invite staff and they can accept
- [ ] No errors in browser console
- [ ] No errors in Supabase Edge Function logs
- [ ] All 3 Edge Functions return successful responses
- [ ] Email delivery works consistently
- [ ] RLS policies allow proper access
- [ ] Performance is acceptable (page load < 3 seconds)

---

## Support & Troubleshooting

If you encounter issues:

1. **Check Logs**
   - Browser console (F12)
   - Supabase Edge Function logs
   - Netlify deploy logs

2. **Common Issues**
   - See `DEPLOYMENT.md` for common issues and solutions
   - Verify environment variables are set correctly
   - Check Supabase redirect URLs match production domain

3. **Emergency Contact**
   - Rollback immediately if critical functionality broken
   - Document the issue for later investigation
   - Contact Xylent Studios dev team

---

## Next Steps (Post-Launch)

After successful deployment:

1. [ ] Monitor for 24 hours
2. [ ] Train State of Mind managers on invite flow
3. [ ] Invite real staff members
4. [ ] Gather user feedback
5. [ ] Plan v1.1.0 enhancements (see `NEXT_STEPS.md`)

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** https://guidelight.xylent.studio  
**Version:** 1.0.0

