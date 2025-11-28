# Step 7: Staff Management (Manager-Only) - Implementation Plan

**Status:** Planning Complete, Ready to Execute  
**Date:** 2025-11-19  
**Estimated Complexity:** High  
**Estimated Time:** 2-3 Composer runs  

---

## 🎯 Goal

Enable managers to invite, view, edit, and delete staff members through a dedicated Staff Management interface.

---

## 📋 Prerequisites

✅ Step 6 (Auth & Session Guard) complete  
✅ AuthContext with `isManager` flag available  
✅ RLS policies deployed (need to add manager INSERT/DELETE before Step 7)  
✅ Test user is manager (Justin - jjdog711@gmail.com)  

---

## 🔐 RLS Policies Required

**MUST BE APPLIED BEFORE IMPLEMENTATION:**

See `notes/RLS_MANAGER_POLICIES.sql` for full SQL. Summary:

1. **`budtenders_managers_insert`** - Allow managers to INSERT new budtenders (for invite flow)
2. **`budtenders_managers_delete`** - Allow managers to DELETE budtenders (hard delete)

**Action:** Apply `RLS_MANAGER_POLICIES.sql` via Supabase MCP before building UI.

---

## 📁 Files to Create/Modify

### **New Files (5):**
1. `src/views/StaffManagementView.tsx` - Main staff management UI
2. `src/components/staff/StaffList.tsx` - List of all staff with filters
3. `src/components/staff/InviteStaffForm.tsx` - Form to invite new staff
4. `src/components/staff/EditStaffForm.tsx` - Form to edit staff profile
5. `src/components/staff/DeleteStaffDialog.tsx` - Double confirmation dialog for delete

### **Existing Files to Modify (3):**
6. `src/App.tsx` - Add Staff Management view to routing
7. `src/components/layout/AppLayout.tsx` - Add "Staff Management" nav link (manager-only)
8. `src/lib/api/budtenders.ts` - Add `createBudtender()` and `deleteBudtender()` functions

---

## 🎨 UI/UX Design

### **Navigation:**
- Add "Staff Management" link to AppLayout header
- Only visible if `isManager === true`
- Link triggers view switch (like Customer/Staff toggle)

### **Staff Management View Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Staff Management                                    │
│ Manage all State of Mind staff members             │
├─────────────────────────────────────────────────────────┤
│ [Invite Staff Member] button                        │
├─────────────────────────────────────────────────────────┤
│ Filters: [All] [Active Only] [Inactive Only]       │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Staff Member Card                               │ │
│ │ Name: Alex Chen                                 │ │
│ │ Email: alex@stateofmind.com                     │ │
│ │ Role: Budtender                                 │ │
│ │ Status: Active                                  │ │
│ │ [Edit] [Toggle Active] [Delete]                │ │
│ └─────────────────────────────────────────────────┘ │
│ (repeat for each staff member)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Features to Implement

### **1. View All Staff**

**Display:**
- Card/table list of all budtenders
- Show: name, email, role, status (active/inactive)
- Sort alphabetically by name

**Filters:**
- "All" (default) - show everyone
- "Active Only" - `is_active = true`
- "Inactive Only" - `is_active = false`

**UI:**
- Use shadcn Card components
- Green indicator for active, gray for inactive
- Responsive grid layout

---

### **2. Invite New Staff**

**⚠️ CRITICAL: Schema Constraint Issue**

Our `budtenders` table requires `auth_user_id NOT NULL`, but we can't create a Supabase auth user without Admin API (service role key). This is a common challenge in Supabase apps.

**MVP Solution: Two-Step Manual Flow**

Since we need to ship MVP without backend/Edge Functions:

**Step 1: Manager Creates Auth User (Supabase Dashboard)**
1. Manager opens Supabase Dashboard → Authentication → Users
2. Clicks "Invite User"
3. Enters new staff member's email
4. Supabase sends magic link invite email automatically
5. Manager copies the new user's UUID from the dashboard

**Step 2: Manager Creates Profile (Guidelight App)**
1. Click "Add Staff Member" in app
2. Form opens with fields:
   - **Auth User ID** (required, text input with paste) - From Step 1
   - **Name** (required, text input)
   - **Role** (required, dropdown: budtender / vault_tech / manager)
   - **Archetype** (optional, text input)
   - **Ideal High** (optional, textarea)
   - **Tolerance Level** (optional, text input)
3. Manager pastes UUID from Step 1
4. Fills remaining fields
5. Clicks "Create Profile"
6. App calls `createBudtender()` with auth_user_id
7. Success: Profile created, staff can log in with invited email

**UI Instructions:**
Display clear help text in the form:
```
⚠️ Before creating a profile:
1. Go to Supabase Dashboard → Auth → Users
2. Click "Invite User" and enter their email
3. Copy the new user's ID
4. Paste it below to link this profile
```

**Why This Approach:**
- ✅ Works with current schema (auth_user_id NOT NULL)
- ✅ No backend/Edge Function needed
- ✅ Supabase auto-sends invite emails
- ✅ Secure (no service role key in client)
- ❌ Poor UX (two-step process)
- ❌ Requires dashboard access

**Post-MVP Enhancement:**
Implement proper invite flow with Edge Function:
```typescript
// Future: Supabase Edge Function
export async function inviteStaff(name, email, role) {
  const { user } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
  await supabase.from('budtenders').insert({
    auth_user_id: user.id,
    name,
    role,
  });
  return { success: true };
}
```

This is the industry-standard approach (Stripe, Linear, Notion all use backend invite APIs).

---

### **3. Edit Staff Profile**

**Trigger:**
- "Edit" button on staff card
- Opens inline form or modal

**Editable Fields:**
- Name
- Role (dropdown)
- Archetype
- Ideal High
- Tolerance Level
- (Email is NOT editable - tied to auth.users)

**Flow:**
1. Click "Edit" → Pre-populate form with current values
2. Manager makes changes
3. Click "Save" → Call `updateBudtender()` (already exists)
4. Success: Update UI, show confirmation
5. Error: Show alert with error message

---

### **4. Toggle Active Status**

**UI:**
- Switch component next to each staff card
- Green = active, Gray = inactive
- Manager can toggle on/off

**Flow:**
1. Click switch
2. Call `updateBudtender(id, { is_active: !current })`
3. Success: Update UI immediately
4. No confirmation needed (non-destructive)

**Effect:**
- Inactive staff don't show in Customer View budtender selector
- Inactive staff can still log in (for now - future: block login)

---

### **5. Hard Delete Staff**

**UI:**
- Red "Delete" button on staff card
- Prominent warning styling

**Flow (Double Confirmation):**
1. Click "Delete" → First dialog:
   - Title: "Delete [Name]?"
   - Message: "This will permanently delete [Name] and all their picks. This action cannot be undone."
   - Buttons: [Cancel] [Continue]
2. If Continue → Second dialog:
   - Title: "Final Confirmation"
   - Message: "Type DELETE to confirm permanent deletion of [Name]"
   - Input field (must type "DELETE" exactly)
   - Buttons: [Cancel] [Delete Permanently]
3. If confirmed → Call `deleteBudtender(id)`
4. Success: Remove from list, show toast/alert
5. Error: Show error message

**Constraints:**
- **Cannot delete self:** Enforced at TWO levels (defense in depth):
  1. **UI:** Disable button if `profile.id === staff.id`
  2. **RLS:** Policy prevents deletion where `id = current_user_id`
  - Why both? UI can be bypassed (DevTools, API calls), RLS cannot
- **Cascades to picks:** Automatic via FK constraint (on delete cascade)

---

## 🔌 API Functions to Add

**File:** `src/lib/api/budtenders.ts`

### **1. `createBudtender()`**

```typescript
export async function createBudtender(
  data: TablesInsert<'budtenders'>
): Promise<Budtender> {
  const { data: newBudtender, error } = await supabase
    .from('budtenders')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create budtender: ${error.message}`);
  }

  return newBudtender;
}
```

**Note:** This will fail via RLS unless manager INSERT policy is applied first.

### **2. `deleteBudtender()`**

```typescript
export async function deleteBudtender(id: string): Promise<void> {
  const { error } = await supabase
    .from('budtenders')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete budtender: ${error.message}`);
  }
}
```

**Note:** This will fail via RLS unless manager DELETE policy is applied first.

---

## 🚦 Implementation Order

### **Phase 1: RLS Policies (CRITICAL)**
1. Apply `notes/RLS_MANAGER_POLICIES.sql` via Supabase MCP
2. Verify policies work by testing INSERT/DELETE in SQL

### **Phase 2: API Helpers**
3. Add `createBudtender()` to `budtenders.ts`
4. Add `deleteBudtender()` to `budtenders.ts`
5. Test both functions via console/dev tools

### **Phase 3: Staff List View**
6. Create `StaffList.tsx` component
7. Fetch all budtenders, display in cards
8. Add filter state (all/active/inactive)
9. Add loading/error states

### **Phase 4: Invite Flow**
10. Create `InviteStaffForm.tsx` component
11. Wire to `createBudtender()` API
12. Show success message with manual invite instructions
13. Clear form after success

### **Phase 5: Edit & Toggle**
14. Create `EditStaffForm.tsx` component
15. Wire to `updateBudtender()` (already exists)
16. Add toggle switch for `is_active`
17. Wire toggle to `updateBudtender()`

### **Phase 6: Delete Flow**
18. Create `DeleteStaffDialog.tsx` component
19. Implement double confirmation (2 dialogs)
20. Wire to `deleteBudtender()` API
21. Add self-deletion prevention

### **Phase 7: Navigation & Integration**
22. Add "Staff Management" link to AppLayout (manager-only)
23. Update App.tsx to include StaffManagementView
24. Add view switching logic (Customer / Staff / Staff Management)
25. Test complete flow end-to-end

---

## 🧪 Testing Checklist

### **As Manager (Justin):**
- [ ] See "Staff Management" link in header
- [ ] Click link → See staff management view
- [ ] See list of all staff (yourself + any others)
- [ ] Filter: All / Active Only / Inactive Only work
- [ ] Create new staff profile (with fake email for testing)
- [ ] See success message with invite instructions
- [ ] Edit staff profile (change name, role)
- [ ] Toggle staff active status (on/off)
- [ ] Try to delete self → Button disabled or shows error
- [ ] Delete test staff → See double confirmation
- [ ] Confirm delete → Staff removed from list
- [ ] Refresh page → Changes persist

### **As Non-Manager (if you create test budtender):**
- [ ] "Staff Management" link NOT visible
- [ ] Cannot access `/staff-management` route (if using URL directly)

---

## ⚠️ Edge Cases & Error Handling

### **1. Auth User ID Validation**
**Issue:** User pastes invalid UUID or wrong ID
**Solution:**
- Validate UUID format before submission
- Try to lookup auth user (if possible) to confirm exists
- Show error: "Invalid User ID. Please check and try again."
- Provide "How to find User ID" help text

### **2. Self-Deletion Prevention (Defense in Depth)**
**UI Level:**
- Check `staff.id !== currentUser.profile.id` before enabling delete
- Show disabled button with tooltip: "Cannot delete yourself"

**RLS Level:**
- Policy prevents deletion where `id = current_user_id`
- Even if UI is bypassed, RLS will block the request
- Error message: "You cannot delete your own account"

**Why both?** Real apps use layered security - never trust client-side checks alone.

### **3. Cascade Delete Verification**
**Behavior:** FK constraint handles picks deletion automatically
**Test Plan:**
1. Create test staff member
2. Add 3+ picks for that staff
3. Delete staff member
4. Query picks table → Should return 0 picks for that staff
5. Verify no orphaned records

**UI Feedback:**
Show pick count in delete confirmation:
"This will permanently delete Alex Chen and their 12 picks."

### **4. Duplicate Auth User ID**
**Issue:** Two profiles trying to use same auth_user_id
**Solution:**
- Unique constraint on `auth_user_id` will prevent this
- Catch error and show: "This user already has a profile"
- Suggest checking if person already exists

### **5. RLS Policy Failures**
**Issue:** Policies not applied or permission denied
**Solution:**
- Check for specific error codes
- If "permission denied" → Show: "You don't have permission to perform this action"
- If "violates foreign key" → Show: "Invalid User ID"
- Log full error to console for debugging

### **6. Deleting Currently Viewed User**
**Issue:** Manager deletes user that's currently being viewed in Customer View
**Solution:**
- Allow the deletion (they left the company)
- When Customer View tries to fetch that user → Error: "User not found"
- Show friendly message: "This staff member is no longer available"
- Auto-select first available staff member

### **7. Network/Timeout Errors**
**Issue:** Request fails due to network
**Solution:**
- Show error with retry button
- Don't leave UI in loading state
- Log error details for debugging

---

## 📦 Component Structure

```
src/
├── views/
│   └── StaffManagementView.tsx          # Main container
├── components/
│   └── staff/
│       ├── StaffList.tsx                # List + filters
│       ├── StaffCard.tsx                # Individual staff card
│       ├── InviteStaffForm.tsx          # Invite modal/form
│       ├── EditStaffForm.tsx            # Edit modal/form
│       └── DeleteStaffDialog.tsx        # Double confirmation
└── lib/
    └── api/
        └── budtenders.ts                # +createBudtender, +deleteBudtender
```

---

## 🎯 Success Criteria

✅ Manager can view all staff (active + inactive)  
✅ Manager can filter staff list  
✅ Manager can create new staff profiles  
✅ Manager can edit any staff profile  
✅ Manager can toggle staff active status  
✅ Manager can delete staff (with double confirmation)  
✅ Self-deletion is prevented  
✅ Non-managers cannot access Staff Management  
✅ All UI is responsive and POS-friendly  
✅ Build succeeds with 0 errors  

---

## 📝 Documentation Updates Needed

After Step 7 completion:
- Update `GUIDELIGHT_MVP_PROGRESS.md` with implementation details
- Update `CHANGELOG.md` with new features
- Note any deviations from plan

---

## 🚀 Ready to Execute

**Pre-flight:**
1. ✅ Auth system working
2. ✅ Justin is manager
3. ⚠️ **CRITICAL:** Apply RLS policies first via MCP
4. ✅ Documentation reviewed

**Estimated Lines of Code:** ~600-800 lines across all files

**Model Suggestion:** GPT-5.1 (CRUD operations, form handling, UI state management)

---

**Next Command:** Apply RLS policies, then begin implementation! 🚀

