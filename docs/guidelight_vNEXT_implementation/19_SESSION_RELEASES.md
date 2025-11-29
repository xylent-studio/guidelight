# Session 19: Releases + What's New

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 7 - Releases & Activity |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 18 completed |
| **Output** | releases table, What's New UI, new release notification |

---

## Pre-Session Checklist

- [ ] Session 18 completed successfully
- [ ] WhatsNewView placeholder exists
- [ ] user_preferences has last_seen_release_id column
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/10_ACCOUNTS_PROFILE_AND_RELEASE_NOTES.md`

---

## Session Goals

1. Create `releases` table
2. Create releases API helpers
3. Build What's New view
4. Show notification dot when new release available
5. Update last_seen_release_id on view

---

## Scope (from CONFLICTS_AND_DECISIONS.md)

**In-scope:**
- releases table
- Latest release display
- New release notification dot
- Mark as seen

**Deferred:**
- Historical release notes timeline
- Rich release content editor

---

## Acceptance Criteria

- [ ] `releases` table created
- [ ] WhatsNewView shows latest release
- [ ] Notification indicator when new release unseen
- [ ] Viewing What's New marks release as seen
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create releases table migration

```sql
-- Migration: create_releases_table

CREATE TABLE public.releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL,
  summary text,
  details_md text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS - everyone can read releases
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "releases_select_all" ON public.releases
  FOR SELECT TO authenticated USING (true);

-- Only managers can modify releases
CREATE POLICY "releases_insert_manager" ON public.releases
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

-- Add FK to user_preferences (if not done in Session 02)
ALTER TABLE public.user_preferences
ADD CONSTRAINT user_preferences_last_seen_release_fk
FOREIGN KEY (last_seen_release_id) REFERENCES public.releases(id) ON DELETE SET NULL;

-- Index for latest release query
CREATE INDEX releases_created_at_idx ON public.releases(created_at DESC);

COMMENT ON TABLE public.releases IS 'Release notes for What''s New feature.';
```

### Step 2: Seed initial release

```sql
-- Migration: seed_initial_release

INSERT INTO public.releases (version, title, summary, details_md)
VALUES (
  '2.2.0',
  'Boards & Drafts',
  'Create custom boards to showcase your picks, with autosaving drafts.',
  '## What''s New in Guidelight 2.2

### Custom Boards
Create themed boards to organize your picks. Perfect for seasonal recommendations, categories, or special promotions.

### Autosaving Drafts
Never lose your work! Pick edits are automatically saved as you type, and you can resume editing anytime.

### Product Catalog
Link your picks to products from the catalog for consistent naming and details.

### And more...
- Improved Display Mode with board selection
- Field visibility toggles
- Profile menu and preferences
'
);
```

### Step 3: Create releases API helpers

Create `src/lib/api/releases.ts`:

```typescript
import { supabase } from '../supabaseClient';

export type Release = {
  id: string;
  version: string;
  title: string;
  summary: string | null;
  details_md: string | null;
  created_at: string;
};

/**
 * Get the latest release
 */
export async function getLatestRelease(): Promise<Release | null> {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching latest release:', error);
    return null;
  }
  
  return data;
}

/**
 * Get all releases
 */
export async function getReleases(): Promise<Release[]> {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Check if user has unseen release
 */
export async function hasUnseenRelease(lastSeenReleaseId: string | null): Promise<boolean> {
  const latest = await getLatestRelease();
  if (!latest) return false;
  return latest.id !== lastSeenReleaseId;
}
```

### Step 4: Create useNewReleaseIndicator hook

Create `src/hooks/useNewReleaseIndicator.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences } from '@/lib/api/userPreferences';
import { hasUnseenRelease } from '@/lib/api/releases';

export function useNewReleaseIndicator(): boolean {
  const { profile } = useAuth();
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    async function check() {
      if (!profile?.id) return;
      
      const prefs = await getUserPreferences(profile.id);
      const unseen = await hasUnseenRelease(prefs?.last_seen_release_id || null);
      setHasNew(unseen);
    }
    
    check();
  }, [profile?.id]);

  return hasNew;
}
```

### Step 5: Update WhatsNewView

```typescript
// Update WhatsNewView.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestRelease, Release } from '@/lib/api/releases';
import { updateLastSeenRelease } from '@/lib/api/userPreferences';

export function WhatsNewView() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const latest = await getLatestRelease();
      setRelease(latest);
      
      // Mark as seen
      if (profile?.id && latest) {
        updateLastSeenRelease(profile.id, latest.id);
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
        title="What's new"
      />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : release ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                  v{release.version}
                </span>
              </div>
              <CardTitle className="mt-2">{release.title}</CardTitle>
              {release.summary && (
                <CardDescription>{release.summary}</CardDescription>
              )}
            </CardHeader>
            {release.details_md && (
              <CardContent>
                <div className="prose prose-sm dark:prose-invert">
                  {/* Simple markdown rendering - could use react-markdown */}
                  <pre className="whitespace-pre-wrap text-sm">
                    {release.details_md}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        ) : (
          <p className="text-muted-foreground">No release notes available.</p>
        )}
      </main>
    </div>
  );
}
```

### Step 6: Add notification dot to ProfileMenu

```typescript
// In ProfileMenu.tsx
import { useNewReleaseIndicator } from '@/hooks/useNewReleaseIndicator';

export function ProfileMenu() {
  const hasNewRelease = useNewReleaseIndicator();
  // ...
  
  return (
    // ...
    <DropdownMenuItem onClick={() => navigate('/whats-new')}>
      <Sparkles size={16} className="mr-2" />
      What's new
      {hasNewRelease && (
        <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
      )}
    </DropdownMenuItem>
    // ...
  );
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/YYYYMMDD_create_releases_table.sql` | Create |
| `supabase/migrations/YYYYMMDD_seed_initial_release.sql` | Create |
| `src/lib/api/releases.ts` | Create |
| `src/hooks/useNewReleaseIndicator.ts` | Create |
| `src/views/WhatsNewView.tsx` | Update |
| `src/components/layout/ProfileMenu.tsx` | Add indicator |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Add releases to data model
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/10_ACCOUNTS_PROFILE_AND_RELEASE_NOTES.md` - Mark releases as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test What's New shows release content
- [ ] Test notification indicator appears for new release
- [ ] Test indicator clears after viewing
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Drop releases table
2. Remove releases.ts and hooks
3. Revert WhatsNewView and ProfileMenu

---

## Next Session

→ **Session 20: Activity Events (minimal)**

