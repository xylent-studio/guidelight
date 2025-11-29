# Session 18: User Preferences Persistence

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 6 - Profile & Preferences |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 17 completed |
| **Output** | Preferences API, last_route and last_board_id persistence |

---

## Pre-Session Checklist

- [ ] Session 17 completed successfully
- [ ] `user_preferences` table exists from Session 02
- [ ] PreferencesView placeholder exists
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/06_PERSISTENCE_AND_DRAFTS_BEHAVIOR.md`

---

## Session Goals

1. Create user_preferences API helpers
2. Track last_route on navigation
3. Track last_board_id in Display Mode
4. Use preferences for Display Mode fallback
5. Build actual PreferencesView UI

---

## Key Preferences

From vNEXT docs:
- `last_route`: Last meaningful route visited (for "resume where I left off")
- `last_board_id`: Last board viewed in Display Mode (for default board)
- `last_seen_release_id`: For What's New (Session 19)

---

## Acceptance Criteria

- [ ] User preferences API helpers work
- [ ] last_route updated on navigation
- [ ] last_board_id updated when viewing boards
- [ ] Display Mode falls back to last_board_id
- [ ] PreferencesView shows/manages preferences
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create user_preferences API helpers

Create `src/lib/api/userPreferences.ts`:

```typescript
import { supabase } from '../supabaseClient';

export type UserPreferences = {
  user_id: string;
  last_route: string | null;
  last_board_id: string | null;
  last_seen_release_id: string | null;
  updated_at: string;
};

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Update user preferences (upsert)
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>
): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Update last route
 */
export async function updateLastRoute(userId: string, route: string): Promise<void> {
  await updateUserPreferences(userId, { last_route: route });
}

/**
 * Update last board
 */
export async function updateLastBoard(userId: string, boardId: string): Promise<void> {
  await updateUserPreferences(userId, { last_board_id: boardId });
}

/**
 * Update last seen release
 */
export async function updateLastSeenRelease(userId: string, releaseId: string): Promise<void> {
  await updateUserPreferences(userId, { last_seen_release_id: releaseId });
}
```

### Step 2: Create useRouteTracking hook

Create `src/hooks/useRouteTracking.ts`:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateLastRoute } from '@/lib/api/userPreferences';

const TRACKABLE_ROUTES = ['/picks', '/boards', '/team', '/preferences'];

export function useRouteTracking() {
  const location = useLocation();
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.id) return;
    
    // Only track "meaningful" routes
    const isTrackable = TRACKABLE_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );
    
    if (isTrackable) {
      updateLastRoute(profile.id, location.pathname);
    }
  }, [location.pathname, profile?.id]);
}
```

### Step 3: Update Display Mode to use last_board_id

```typescript
// In DisplayModeView.tsx
import { getUserPreferences, updateLastBoard } from '@/lib/api/userPreferences';

// In loadBoard function:
useEffect(() => {
  async function loadBoard() {
    // ... existing code ...
    
    let targetBoard: Board | null = null;
    
    if (boardId) {
      // Specific board from URL
      targetBoard = await getBoardById(boardId);
    } else if (profile?.id) {
      // Try to get last board from preferences
      const prefs = await getUserPreferences(profile.id);
      if (prefs?.last_board_id) {
        targetBoard = await getBoardById(prefs.last_board_id);
      }
    }
    
    if (!targetBoard) {
      // Fall back to auto_store
      targetBoard = await getAutoStoreBoard();
    }
    
    // ... rest of loading ...
    
    // Save this board as last viewed (for logged-in users)
    if (profile?.id && targetBoard) {
      updateLastBoard(profile.id, targetBoard.id);
    }
  }
  
  loadBoard();
}, [boardId, profile?.id]);
```

### Step 4: Build PreferencesView UI

```typescript
// Update PreferencesView.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, UserPreferences } from '@/lib/api/userPreferences';

export function PreferencesView() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (profile?.id) {
        const data = await getUserPreferences(profile.id);
        setPrefs(data);
      }
      setLoading(false);
    }
    load();
  }, [profile?.id]);

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
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
              <CardDescription>
                These are automatically saved as you use the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Last visited route</p>
                <p className="text-sm text-muted-foreground">
                  {prefs?.last_route || 'None'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Default board</p>
                <p className="text-sm text-muted-foreground">
                  {prefs?.last_board_id ? 'Board selected' : 'Using house list'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
```

### Step 5: Add route tracking to App

```typescript
// In App.tsx or a top-level component:
import { useRouteTracking } from '@/hooks/useRouteTracking';

function AppContent() {
  useRouteTracking();
  // ... rest of app
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/api/userPreferences.ts` | Create |
| `src/hooks/useRouteTracking.ts` | Create |
| `src/views/DisplayModeView.tsx` | Add last_board_id fallback |
| `src/views/PreferencesView.tsx` | Build actual UI |
| `src/App.tsx` | Add route tracking |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/06_PERSISTENCE_AND_DRAFTS_BEHAVIOR.md` - Mark user preferences as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test last_route tracking
- [ ] Test Display Mode fallback to last_board_id
- [ ] Test PreferencesView shows correct data
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove userPreferences.ts
2. Remove useRouteTracking.ts
3. Revert DisplayModeView and PreferencesView changes

---

## Next Session

→ **Session 19: Releases + What's New**

