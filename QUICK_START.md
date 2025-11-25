# Guidelight Quick Start

## For Deployment

1. **Push to GitHub** (Already done! ✅)
   ```bash
   git push origin main
   git push origin v1.0.0
   ```

2. **Deploy to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - "Add new site" → "Import an existing project"
   - Connect GitHub → `xylent-studio/guidelight`
   - Base directory: `02_projects/guidelight`
   - Build command: `npm run build`
   - Publish directory: `02_projects/guidelight/dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy!

3. **Update Supabase**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Change Site URL to: `https://guidelight.xylent.studio`
   - Add to Redirect URLs: `https://guidelight.xylent.studio` and `https://guidelight.xylent.studio/**`

4. **Test Everything**
   - Follow `DEPLOYMENT_CHECKLIST.md`
   - Test login, invite, password reset

## For Local Development

```bash
cd C:\dev\Xylent_Studios\02_projects\guidelight
nvm use 22.18.0  # or any Node.js >= 20.19.0
npm install
npm run dev
```

Visit: `http://localhost:5173`

## Key Files

- `DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `CHANGELOG.md` - Version history
- `README.md` - Project overview
- `netlify.toml` - Netlify configuration (already configured)

## Current Status

✅ **Version 1.0.0 - Ready for Production**

- All code committed and pushed to GitHub
- Tagged as v1.0.0
- Production build tested (0 errors)
- Edge Functions deployed and active
- Documentation complete

## What's Deployed

**Edge Functions:**
- `invite-staff` (v6) - One-click staff invitation
- `get-staff-with-status` (v1) - Staff dashboard with invite status
- `reset-staff-password` (v1) - Manager password reset

**Features:**
- Complete authentication system
- Staff invite workflow
- Password reset/change
- Staff management dashboard
- Customer/Staff views

## Next Steps

1. Deploy to Netlify using steps above
2. Update Supabase redirect URLs
3. Test thoroughly using checklist
4. Invite real staff members
5. Monitor for 24 hours

## Support

Questions? Check:
1. `DEPLOYMENT.md` for detailed instructions
2. `DEPLOYMENT_CHECKLIST.md` for testing steps
3. Supabase Edge Function logs for errors
4. Browser console for client errors

---

**Production URL:** https://guidelight.xylent.studio  
**GitHub:** https://github.com/xylent-studio/guidelight  
**Version:** 1.0.0

