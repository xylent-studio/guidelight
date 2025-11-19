# Guidelight: Post-MVP Enhancements

**Last Updated:** 2025-11-19  
**Status:** Planning for future iterations

This document captures features and improvements to implement after MVP validation.

---

## 🚀 High Priority (V1.1)

### **1. Proper Invite Flow with Edge Function**
**Current (MVP):** Two-step manual process (Dashboard → App)  
**Improvement:** One-click invite from app

**Implementation:**
```typescript
// Supabase Edge Function
export async function inviteStaff(name, email, role, metadata) {
  // 1. Create auth user with Admin API
  const { user, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { name, role }
  });
  
  if (authError) throw authError;
  
  // 2. Create budtender profile
  const { data: profile, error: profileError } = await supabase
    .from('budtenders')
    .insert({
      auth_user_id: user.id,
      name,
      role,
      ...metadata
    })
    .select()
    .single();
  
  if (profileError) {
    // Rollback: delete auth user
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw profileError;
  }
  
  return { success: true, profile };
}
```

**Benefits:**
- ✅ One-click invite from app UI
- ✅ Auto-send invite emails
- ✅ Transactional (rollback on failure)
- ✅ No context switching

**Effort:** 4-6 hours  
**Reference:** This is how Stripe, Linear, Notion do it

---

### **2. Toast Notifications**
**Current (MVP):** `alert()` for all feedback  
**Improvement:** Non-blocking toast notifications

**Library Options:**
- `sonner` (recommended - 2KB, React 18 compatible)
- `react-hot-toast` (popular, 3KB)
- shadcn/ui toast component

**Usage:**
```typescript
import { toast } from 'sonner';

// Success
toast.success('Staff member deleted successfully');

// Error
toast.error('Failed to update profile');

// Loading
const toastId = toast.loading('Creating profile...');
toast.success('Profile created!', { id: toastId });
```

**Benefits:**
- ✅ Better UX (non-blocking)
- ✅ Stackable notifications
- ✅ Auto-dismiss with undo option
- ✅ More professional

**Effort:** 2-3 hours

---

### **3. Audit Logging**
**Current (MVP):** No activity tracking  
**Improvement:** Log all critical actions

**Schema:**
```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,  -- 'create_user', 'delete_user', 'update_profile', etc.
  actor_id uuid references budtenders(id),
  actor_name text,  -- Denormalized for reporting
  target_id uuid,
  target_name text,
  details jsonb,  -- Flexible payload (before/after values, etc.)
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Index for common queries
create index audit_logs_actor_created_idx on audit_logs(actor_id, created_at desc);
create index audit_logs_action_created_idx on audit_logs(action, created_at desc);
```

**Track:**
- Staff creation/deletion
- Profile updates (show before/after)
- Pick creation/deletion
- Login/logout events
- Failed permission attempts

**UI:**
- Manager-only "Activity Log" page
- Filter by action, date range, staff member
- Export to CSV for compliance

**Benefits:**
- ✅ Accountability ("Who deleted Sarah?")
- ✅ Compliance/legal requirements
- ✅ Debugging (trace what happened)
- ✅ Security monitoring

**Effort:** 6-8 hours

---

## 🎯 Medium Priority (V1.2)

### **4. Soft Delete with Restore**
**Current (MVP):** Hard delete only  
**Improvement:** 30-day grace period

**Schema Change:**
```sql
alter table budtenders 
  add column deleted_at timestamptz,
  add column deleted_by uuid references budtenders(id);

-- Update queries to filter out deleted
create view active_budtenders as
  select * from budtenders 
  where deleted_at is null;
```

**UI:**
- "Recently Deleted" tab in Staff Management
- Show deleted staff for 30 days
- "Restore" button (sets deleted_at to null)
- Auto-purge after 30 days (cron job)

**Benefits:**
- ✅ Undo accidental deletions
- ✅ Grace period for data recovery
- ✅ Industry standard (Gmail, Slack, etc.)

**Effort:** 4-6 hours

---

### **5. Bulk Operations**
**Current (MVP):** One-at-a-time actions  
**Improvement:** Multi-select + bulk actions

**Features:**
- Checkbox selection on staff cards
- "Select All" option
- Bulk toggle active/inactive
- Bulk export to CSV
- Confirmation: "Toggle 5 staff members?"

**Benefits:**
- ✅ Faster for large teams
- ✅ Seasonal staff management
- ✅ Common enterprise feature

**Effort:** 3-4 hours

---

### **6. Staff Profile Photos**
**Current (MVP):** No photos  
**Improvement:** Upload/display photos

**Implementation:**
- Use Supabase Storage bucket
- Upload via file input
- Resize/optimize on upload
- Display in Customer View (optional)
- Fallback to initials avatar

**Benefits:**
- ✅ More personal Customer View
- ✅ Easier staff identification
- ✅ Professional appearance

**Effort:** 4-5 hours

---

## 💡 Nice to Have (V2.0)

### **7. Email Customization**
Allow managers to customize invite email template:
- Custom welcome message
- Store branding
- Training resources links

### **8. Role-Based Permissions**
More granular than budtender/manager:
- View-only users (for ownership/corporate)
- Inventory manager (vault tech + special permissions)
- Custom roles with permission matrix

### **9. Staff Onboarding Checklist**
Track new hire progress:
- Profile completed
- First pick added
- Training modules viewed
- First Customer View session

### **10. Performance Analytics**
Track staff engagement:
- Pick update frequency
- Customer View usage
- Popular picks by staff
- Conversion metrics (if integrated with POS)

### **11. Advanced Search & Filtering**
Search staff by:
- Name, email, role
- Archetype, ideal high
- Date added, last active
- Pick count, categories covered

### **12. Import/Export**
- Bulk import staff from CSV
- Export staff list with picks
- Backup/restore functionality

### **13. Mobile App Optimization**
- Progressive Web App (PWA)
- Offline mode
- Push notifications
- Native mobile apps (iOS/Android)

---

## 🔒 Security Enhancements

### **14. Two-Factor Authentication (2FA)**
For manager accounts:
- TOTP (Google Authenticator)
- SMS backup codes
- Required for sensitive actions (delete staff)

### **15. Session Management**
- View active sessions
- Force logout (security breach)
- Session timeout customization
- IP whitelisting for managers

### **16. Advanced RLS**
- Time-based access (work hours only)
- Location-based access (in-store only)
- Temporary elevated permissions

---

## 🛠️ Technical Debt

### **17. Automated Testing**
- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests for critical flows
- RLS policy tests

### **18. Performance Optimization**
- Code splitting (reduce bundle size)
- Image optimization
- Lazy loading for staff list
- Virtual scrolling for large lists

### **19. Error Boundary**
- Catch React errors gracefully
- Show friendly error page
- Auto-report to error tracking (Sentry)

### **20. TypeScript Strictness**
- Enable `strict: true`
- Remove any `any` types
- Proper error typing

---

## 📊 Prioritization Framework

**High Priority:** Critical for production readiness or major UX improvements  
**Medium Priority:** Nice improvements but MVP works without them  
**Nice to Have:** Future vision, enhance mature product

**Effort Scale:**
- 2-3 hours: Quick win
- 4-6 hours: Medium task
- 6-8 hours: Complex feature
- 8+ hours: Multi-day project

---

## 🎯 Recommended Roadmap

### **Phase 1: Production Hardening (Week 1-2)**
1. ✅ Proper invite flow (Edge Function)
2. ✅ Toast notifications
3. ✅ Audit logging

### **Phase 2: UX Polish (Week 3-4)**
4. ✅ Soft delete with restore
5. ✅ Bulk operations
6. ✅ Staff photos

### **Phase 3: Advanced Features (Month 2)**
7. ✅ Email customization
8. ✅ Role-based permissions
9. ✅ Performance analytics

### **Phase 4: Scale & Security (Month 3+)**
10. ✅ Advanced search
11. ✅ 2FA for managers
12. ✅ Automated testing

---

## 📝 Contributing

When implementing these features:
1. Create feature branch from `main`
2. Update this document (move to "In Progress")
3. Follow existing code patterns
4. Update CHANGELOG.md
5. Add to GUIDELIGHT_MVP_PROGRESS.md
6. Submit PR with screenshots

---

## 📚 References

**Industry Examples:**
- Stripe Dashboard - Invite flow, audit logs, bulk actions
- Linear - Toast notifications, soft delete, keyboard shortcuts
- Notion - Staff management, role-based permissions
- Slack - User management, session control, 2FA

**Technical Resources:**
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [React Testing Library](https://testing-library.com/react)
- [Sonner Toast](https://sonner.emilkowal.ski/)

---

**Last Review:** 2025-11-19  
**Next Review:** After MVP launch + 2 weeks

