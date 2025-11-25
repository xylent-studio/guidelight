# Guidelight: Post-MVP Enhancements

**Last Updated:** 2025-11-25  
**Status:** Planning for future iterations (Edge Function invite flow completed)

This document captures features and improvements to implement after MVP validation.

---

## 🚀 High Priority (V1.1)

### **1. Proper Invite Flow with Edge Function** ✅ COMPLETED
**Status:** Implemented in v1.0.0  
**Implementation:** `supabase/functions/invite-staff/` (v7)

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

### **2. Customer View Fullscreen Mode** 🆕
**Current (MVP):** No fullscreen option  
**Improvement:** Toggle fullscreen for POS displays

**Requirements:**
- **Button location:** Centered-right of the "Budtenders & their picks" header
- **Icon:** Expand/fullscreen icon (e.g., `Maximize2` from Lucide)
- **Behavior:** 
  - Click toggles browser Fullscreen API (`document.documentElement.requestFullscreen()`)
  - When fullscreen: Show small exit button (corner) to return to normal view
  - Escape key also exits fullscreen (browser default)
- **States:**
  - Normal: Show expand icon with "Fullscreen" tooltip
  - Fullscreen: Show minimize icon with "Exit Fullscreen" tooltip

**Implementation:**
```typescript
// Custom hook for fullscreen
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);
  
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  
  return { isFullscreen, toggle };
}
```

**Benefits:**
- ✅ Cleaner POS display (no browser chrome)
- ✅ Maximizes screen real estate for customer-facing view
- ✅ Professional kiosk-like experience
- ✅ Easy to exit when needed

**Effort:** 2-3 hours  
**Priority:** High (requested for POS experience)

---

### **4. Toast Notifications**
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

### **5. Audit Logging**
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

### **6. Soft Delete with Restore**
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

### **7. Bulk Operations**
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

### **8. Staff Profile Photos**
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

### **9. Email Customization**
Allow managers to customize invite email template:
- Custom welcome message
- Store branding
- Training resources links

### **10. Role-Based Permissions**
More granular than budtender/manager:
- View-only users (for ownership/corporate)
- Inventory manager (vault tech + special permissions)
- Custom roles with permission matrix

### **11. Staff Onboarding Checklist**
Track new hire progress:
- Profile completed
- First pick added
- Training modules viewed
- First Customer View session

### **12. Performance Analytics**
Track staff engagement:
- Pick update frequency
- Customer View usage
- Popular picks by staff
- Conversion metrics (if integrated with POS)

### **13. Advanced Search & Filtering**
Search staff by:
- Name, email, role
- Expertise, vibe, tolerance (profile fields)
- Date added, last active
- Pick count, categories covered

### **14. Import/Export**
- Bulk import staff from CSV
- Export staff list with picks
- Backup/restore functionality

### **15. Mobile App Optimization**
- Progressive Web App (PWA)
- Offline mode
- Push notifications
- Native mobile apps (iOS/Android)

---

## 🔒 Security Enhancements

### **16. Two-Factor Authentication (2FA)**
For manager accounts:
- TOTP (Google Authenticator)
- SMS backup codes
- Required for sensitive actions (delete staff)

### **17. Session Management**
- View active sessions
- Force logout (security breach)
- Session timeout customization
- IP whitelisting for managers

### **18. Advanced RLS**
- Time-based access (work hours only)
- Location-based access (in-store only)
- Temporary elevated permissions

---

## 🛠️ Technical Debt

### **19. Automated Testing**
- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests for critical flows
- RLS policy tests

### **20. Performance Optimization**
- Code splitting (reduce bundle size)
- Image optimization
- Lazy loading for staff list
- Virtual scrolling for large lists

### **21. Error Boundary**
- Catch React errors gracefully
- Show friendly error page
- Auto-report to error tracking (Sentry)

### **22. TypeScript Strictness**
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
2. 🔜 Customer View fullscreen mode (High priority for POS)
3. Toast notifications
4. Audit logging

### **Phase 2: UX Polish (Week 3-4)**
5. Soft delete with restore
6. Bulk operations
7. Staff photos

### **Phase 3: Advanced Features (Month 2)**
8. Email customization
9. Role-based permissions
10. Performance analytics

### **Phase 4: Scale & Security (Month 3+)**
11. Advanced search
12. 2FA for managers
13. Automated testing

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

**Last Review:** 2025-11-25  
**Next Review:** After v1.1.0 deployment + 2 weeks

