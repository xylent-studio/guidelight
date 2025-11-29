# Session 17: Profile Menu (stretch) + Prefs entry point

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 6 - Profile & Preferences |
| **Estimated Duration** | 2 hours |
| **Prerequisites** | Session 16 completed |
| **Output** | ProfileMenu component, basic profile/prefs entry points |

---

## Pre-Session Checklist

- [ ] Session 16 completed successfully
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/10_ACCOUNTS_PROFILE_AND_RELEASE_NOTES.md`
- [ ] Check existing header/menu patterns

---

## Session Goals

1. Create ProfileMenu component (stretch: full menu, minimum: basic)
2. Add Preferences entry point
3. Add What's New entry point (link to releases UI in Session 19)

---

## Scope

**Minimum (must do):**
- Basic profile dropdown in header
- "Preferences" menu item (placeholder view)
- "What's new" menu item (placeholder)
- Log out

**Stretch (if time):**
- Avatar display
- "My Profile" link
- Full menu styling per vNEXT docs

---

## Acceptance Criteria

- [ ] Profile menu accessible from header
- [ ] Shows current user name
- [ ] "Preferences" menu item (placeholder)
- [ ] "What's new" menu item (placeholder)
- [ ] "Log out" works
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create ProfileMenu component

Create `src/components/layout/ProfileMenu.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const initials = profile.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/preferences')}>
          <Settings size={16} className="mr-2" />
          Preferences
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/whats-new')}>
          <Sparkles size={16} className="mr-2" />
          What's new
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut size={16} className="mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Step 2: Create placeholder views

Create `src/views/PreferencesView.tsx`:

```typescript
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';

export function PreferencesView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        leftContent={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
        }
        title="Preferences"
      />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <p className="text-muted-foreground">
          Preferences settings coming in next session.
        </p>
      </main>
    </div>
  );
}
```

Create `src/views/WhatsNewView.tsx`:

```typescript
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';

export function WhatsNewView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        leftContent={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
        }
        title="What's new"
      />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <p className="text-muted-foreground">
          Release notes coming in Session 19.
        </p>
      </main>
    </div>
  );
}
```

### Step 3: Add routes to App.tsx

```typescript
import { PreferencesView } from './views/PreferencesView';
import { WhatsNewView } from './views/WhatsNewView';

// Add routes:
<Route 
  path="/preferences" 
  element={
    <ProtectedRoute>
      <PreferencesView />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/whats-new" 
  element={
    <ProtectedRoute>
      <WhatsNewView />
    </ProtectedRoute>
  } 
/>
```

### Step 4: Add ProfileMenu to headers

Update headers in MyPicksView, BoardsHomeView, etc.:

```typescript
import { ProfileMenu } from '@/components/layout/ProfileMenu';

// In HeaderBar rightContent:
<ProfileMenu />
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/layout/ProfileMenu.tsx` | Create |
| `src/views/PreferencesView.tsx` | Create |
| `src/views/WhatsNewView.tsx` | Create |
| `src/App.tsx` | Add routes |
| `src/views/MyPicksView.tsx` | Add ProfileMenu |
| `src/views/BoardsHomeView.tsx` | Add ProfileMenu |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Add /preferences, /whats-new routes
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/10_ACCOUNTS_PROFILE_AND_RELEASE_NOTES.md` - Mark profile menu as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test profile menu opens and shows user info
- [ ] Test menu items navigate correctly
- [ ] Test logout works
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove ProfileMenu component
2. Remove placeholder views
3. Remove routes

---

## Next Session

→ **Session 18: User Preferences Persistence**

