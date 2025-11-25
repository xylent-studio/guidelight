# Guidelight Manager Guide

This guide covers administrative tasks for managers: inviting staff, managing the team, reviewing feedback, and keeping Guidelight running smoothly.

---

## Quick Reference

| Task | Where |
|------|-------|
| Invite new staff | Staff Management → Invite Staff |
| Edit staff info | Staff Management → click staff card |
| Deactivate staff | Staff Management → toggle "Can sign in" |
| Hide from customers | Staff Management → toggle "Show in Customer View" |
| Reset password | Staff Management → staff card → Reset Password |
| View feedback | Staff Management → Feedback tab |

---

## Inviting New Staff

When a new budtender joins the team, you can invite them directly from Guidelight — no need for IT or Supabase access.

### How to Send an Invite

1. Go to **Staff Management** (button in the header, managers only)
2. Click **Invite Staff** in the top right
3. Fill in:
   - **Email** — The email address they'll use to log in
   - **Name** — Their display name (what customers see)
   - **Role** — Usually "Budtender" for front-of-house staff
4. Click **Send Invite**

The new staff member will receive an email with a magic link. When they click it, they're automatically logged in and can start setting up their profile.

### What Happens Next

- Their profile is created automatically with default settings
- They can fill in their vibe, expertise, and tolerance
- They can start adding picks right away
- By default, they're visible to customers

### Invite Tips

- Double-check the email address — typos mean the invite goes nowhere
- Use their work email if they have one
- If they don't receive the email, check spam folders first
- You can resend invites from Staff Management if needed

---

## Managing Staff

### Viewing Your Team

Go to **Staff Management** to see all staff members in a grid view. Each card shows:

- Name and role
- Email address
- Status indicators (active, pending invite, etc.)
- Quick toggles for permissions

Your own card appears first, followed by other staff alphabetically.

### Editing Staff Info

Click on any staff card to expand it and edit:

- **Name** — Update their display name
- **Role** — Change between Budtender, Vault Tech, or Manager
- **Profile fields** — Vibe, expertise, tolerance (usually staff manage their own)

Changes save automatically when you click outside the field or press Enter.

### Staff Status Toggles

Each staff card has two important toggles:

**Can sign in** — Controls whether they can log into Guidelight
- Turn OFF when someone leaves or goes on extended leave
- Their picks remain in the system but they can't edit anything
- Turn back ON when they return

**Show in Customer View** — Controls customer visibility
- Turn OFF to hide them from the budtender selector
- They can still log in and manage their picks
- Useful for training, back-of-house staff, or demo accounts

### Deleting Staff

To permanently remove a staff member:

1. Click their card to expand it
2. Scroll down to **Delete Staff Member**
3. Type their name to confirm
4. Click **Delete**

**Warning:** This is permanent. All their picks will be deleted. Only do this for cleanup — use "Can sign in: OFF" for temporary deactivation.

---

## Password Reset

If a staff member is locked out or forgot their password:

1. Go to **Staff Management**
2. Find their card and expand it
3. Click **Reset Password**
4. They'll receive an email with a link to set a new password

**Note:** You can't see or set their password directly — only send a reset link.

---

## Reviewing Feedback

Staff can submit bug reports and suggestions through the **Feedback** button. As a manager, you can review all submissions.

### Viewing Feedback

1. Go to **Staff Management**
2. Click the **Feedback** tab at the top
3. Browse submitted reports

Each feedback entry shows:
- Who submitted it and when
- Type (bug report or suggestion)
- Their message
- Contact preference (if they want follow-up)

### Responding to Feedback

Currently, feedback is view-only in the app. For follow-up:
- Note the submitter's name
- Talk to them in person or via your team chat
- For bugs, file an issue with development

---

## Training New Staff

Here's a suggested flow for getting new budtenders started:

### Day 1: Account Setup

1. Send them an invite before their first shift
2. Have them click the magic link and log in
3. Walk them through Staff View together
4. Help them fill in their profile (vibe, expertise, tolerance)

### First Week: Adding Picks

1. Encourage them to add 3-5 picks across different categories
2. Review their picks together — coach on good "Why I Love It" descriptions
3. Show them how Customer View displays their picks
4. Practice flipping the screen to show a customer

### Ongoing

- Remind staff to update picks when products go in/out of stock
- Encourage seasonal updates (new favorites, holiday picks)
- Use the Feedback button to report issues

### Training Tips

- Start with categories they know best (usually Flower or Pre-rolls)
- 4-star ratings are fine — not everything needs to be 5 stars
- Short, specific "Why I Love It" descriptions work best
- The demo user "allday" shows a fully populated example

---

## Common Manager Tasks

### Staff member can't log in
1. Check if "Can sign in" toggle is ON
2. Try sending a password reset
3. Verify their email address is correct
4. Resend the invite if they never completed signup

### Staff member not showing in Customer View
1. Check if "Show in Customer View" toggle is ON
2. Make sure they have at least one active pick
3. Refresh the page in Customer View

### Someone left the company
1. Turn "Can sign in" OFF immediately
2. Decide whether to keep or delete their picks
3. If deleting, use the Delete function (permanent)

### Need to demo Guidelight
1. The "allday" user is pre-configured as a demo account
2. It has a full profile and picks across all categories
3. Toggle "Show in Customer View" ON to include in demos
4. Toggle it OFF when not demoing

### Multiple locations
Currently, Guidelight is single-location. All staff see the same budtender list. If you have multiple locations, reach out to development for multi-location support.

---

## Security Notes

- **Managers can edit any staff member's profile and picks** — use responsibly
- **Managers cannot see passwords** — only send reset links
- **Deleted staff are permanent** — there's no undo
- **Session timeouts** — staff stay logged in until they sign out manually
- **Bookmark the URL** — but don't share login links publicly

---

## Getting Help

For technical issues beyond this guide:

1. **Use the Feedback button** to report bugs
2. **Contact development** for urgent issues
3. **Check the docs folder** for technical documentation

---

**Questions about this guide?** Talk to Justin or file feedback.

*Guidelight Manager Guide v1.0 — Xylent Studios*

