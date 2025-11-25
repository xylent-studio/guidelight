# Guidelight Alpha Testing Checklist

**Version:** 1.4.0  
**Test Site:** State of Mind Dispensary  
**Start Date:** [TBD]  
**Testers:** SOM Staff + Justin

---

## 🎯 Testing Goals

1. **Validate core functionality** in a real dispensary environment
2. **Gather user feedback** on UX and workflow
3. **Identify bugs** before broader rollout
4. **Test on actual POS hardware** (Windows, Chrome/Edge)

---

## 📱 Test Devices

| Device | OS | Browser | Priority |
|--------|-----|---------|----------|
| POS Machine | Windows 10/11 | Chrome/Edge | High |
| Staff phones | iOS/Android | Safari/Chrome | Medium |
| Tablets | iPad/Android | Safari/Chrome | Medium |

---

## 🔐 Pre-Testing Setup

### Supabase Configuration
- [ ] Site URL set to `https://guidelight.xylent.studio`
- [ ] Redirect URLs include production domain + `/**`
- [ ] Email templates synced (invite, recovery)
- [ ] Edge Functions deployed and active

### Netlify Deployment
- [ ] Environment variables set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Build succeeded

### Test Accounts
- [ ] At least 1 manager account ready
- [ ] Staff invites sent to alpha testers
- [ ] All testers have set passwords

---

## ✅ Core Functionality Tests

### Authentication

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| Login | Enter email + password → Sign In | Redirects to Staff View | ☐ |
| Invalid login | Enter wrong password | Shows error, stays on login | ☐ |
| Logout | Click Logout → Confirm | Returns to login page | ☐ |
| Session persistence | Login → Refresh page | Stay logged in | ☐ |
| Forgot password | Click "Forgot your password?" → Enter email | Receive reset email | ☐ |
| Accept invite | Click invite link in email | Set password, auto-login | ☐ |

### Customer View

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| Select budtender | Click budtender name | Show their picks | ☐ |
| View profile | Select budtender | See vibe, expertise, tolerance | ☐ |
| Category tabs | Click each category tab | Filter picks correctly | ☐ |
| Pick cards | View picks | See name, brand, stars, tags, "Why I love it" | ☐ |
| Star ratings | View pick cards | Stars display correctly | ☐ |
| Deals tab | Click "Deals" | Show deal-tagged picks | ☐ |
| Personal tab | Click "Personal" | Show personal favorites | ☐ |
| Empty category | View category with no picks | Show "No picks" message | ☐ |

### Staff View

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| View own picks | Open Staff View | See your picks by category | ☐ |
| Add pick | Click "Add Pick" → Fill form → Save | Pick appears in list | ☐ |
| Edit pick | Click pick → Edit → Change fields → Save | Updates saved | ☐ |
| Set rating | Click stars in form | Half-star values work | ☐ |
| Toggle active | Click active switch | Pick moves to inactive section | ☐ |
| Delete pick | Click pick → Delete → Confirm | Pick removed | ☐ |
| Edit profile | Fill My vibe, Expertise, Tolerance → Save | Profile updates | ☐ |
| Profile in Customer View | Edit profile → Switch to Customer View | See updated profile | ☐ |

### Staff Management (Manager Only)

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| Access tab | Click "Staff Management" | Tab visible (managers only) | ☐ |
| View staff list | Open Staff Management | See all staff with status | ☐ |
| Invite staff | Click "Invite Staff" → Fill form → Send | Invite email sent | ☐ |
| Edit staff | Click Edit on any staff → Change fields → Save | Updates saved | ☐ |
| Toggle staff active | Flip switch | Staff active status changes | ☐ |
| Delete staff | Click Delete → Double confirm | Staff removed (cascade) | ☐ |
| Self-delete protection | Try to delete yourself | Button disabled | ☐ |
| Filter tabs | Click Active/Inactive/Pending | Filters correctly | ☐ |

### Feedback System

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| Button visible | View any page | See floating button (bottom-right) | ☐ |
| Open modal | Click feedback button | Modal opens | ☐ |
| Submit feedback | Fill form → Send it | Success message | ☐ |
| Anonymous default | Submit without checking name | Submits anonymously | ☐ |
| Attach name | Check "Attach my name" → Submit | Name attached | ☐ |
| View feedback (manager) | Staff Management → Feedback tab | See all feedback | ☐ |
| Update status | Change status dropdown | Status updates | ☐ |
| Add notes | Click notes area → Type → Save | Notes saved | ☐ |
| Badge count | Have new feedback | Badge shows count | ☐ |

### Theme Toggle (v1.4.0)

| Test | Steps | Expected | Pass? |
|------|-------|----------|-------|
| Toggle visible | Staff View → Scroll to footer | See Light/System/Dark toggle | ☐ |
| Light mode | Click "Light" | UI uses light theme (cream backgrounds) | ☐ |
| Dark mode | Click "Dark" | UI uses dark theme (green-tinted dark) | ☐ |
| System mode | Click "System" | Follows OS preference | ☐ |
| Persists | Change theme → Refresh page | Theme persists | ☐ |
| Hidden in Customer View | Switch to Customer View | Toggle not visible | ☐ |

---

## 📊 Performance Tests

| Test | Expected | Pass? |
|------|----------|-------|
| Initial load time | < 3 seconds | ☐ |
| Page navigation | Instant | ☐ |
| Pick save time | < 1 second | ☐ |
| No console errors | Clean console | ☐ |

---

## 📱 Responsive/Device Tests

| Test | Device | Pass? |
|------|--------|-------|
| POS layout (landscape) | Windows POS | ☐ |
| Mobile layout | Phone | ☐ |
| Touch targets | Tablet | ☐ |
| Font readability | All devices | ☐ |

---

## 🐛 Bug Reporting

**Using the built-in feedback system:**

1. Click the floating button (bottom-right)
2. Select type: **Bug**
3. Describe:
   - What you were doing
   - What you expected
   - What actually happened
4. Set urgency appropriately
5. Attach your name if you want follow-up

**For critical/blocking issues:**
- Call/text Justin: **518.852.8870**
- Email: **justinmichalke@gmail.com**

---

## 📋 Feedback Collection

**We want to hear about:**
- ✅ Confusing UI elements
- ✅ Missing features you expected
- ✅ Things that feel slow
- ✅ Ideas for improvement
- ✅ What you love about it
- ✅ Anything that makes your job harder

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Critical bugs found | 0 after fixes |
| Staff can create picks without help | 80%+ |
| Customer View useful during sales | Positive feedback |
| Feedback submissions | At least 10 during alpha |

---

## 📝 Daily Testing Notes

### Day 1
- Testers: 
- Issues found:
- Feedback received:

### Day 2
- Testers:
- Issues found:
- Feedback received:

### Day 3+
- Continue logging...

---

## 🚀 Post-Alpha Actions

1. Review all feedback submissions
2. Prioritize bug fixes
3. Plan v1.4.0 improvements based on feedback
4. Schedule broader rollout

---

**Document maintained by:** Xylent Studios  
**Last updated:** 2025-11-25

