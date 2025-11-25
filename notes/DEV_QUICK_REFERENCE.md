# Guidelight Developer Quick Reference

**Quick lookup for common patterns and gotchas**

---

## 🔐 Auth Patterns

### Check if user is logged in
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <div>Welcome, {profile?.name}!</div>;
}
```

### Check if user is a manager
```tsx
const { isManager } = useAuth();

return (
  <>
    {isManager && <StaffManagementLink />}
  </>
);
```

### Auto-select logged-in user
```tsx
const { profile } = useAuth();
const [selectedBudtender, setSelectedBudtender] = useState(profile?.id || '');
```

---

## 📊 Data Fetching Patterns

### Fetch with error handling
```tsx
const [picks, setPicks] = useState<Pick[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPicksForBudtender(budtenderId);
      setPicks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load picks');
    } finally {
      setLoading(false);
    }
  }
  load();
}, [budtenderId]);
```

### Reload after mutation
```tsx
async function handleCreatePick(data: PickInsert) {
  try {
    await createPick(data);
    alert('Pick created!');
    // Reload picks to reflect changes
    const updated = await getPicksForBudtender(budtenderId);
    setPicks(updated);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}
```

---

## 🎨 UI Patterns

### POS-friendly button
```tsx
<Button size="lg" className="min-h-[44px]">
  Large Tap Target
</Button>
```

### Card with semantic colors
```tsx
<Card className="bg-surface border-border hover:border-primary transition-colors">
  <CardHeader>
    <CardTitle className="text-text">Title</CardTitle>
    <p className="text-text-muted">Subtitle</p>
  </CardHeader>
</Card>
```

### Effect tag badges
```tsx
{pick.effect_tags?.map((tag) => (
  <Badge key={tag} variant="secondary" className="bg-primary-soft text-primary">
    {tag}
  </Badge>
))}
```

### Responsive grid (Customer View)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {picks.slice(0, 6).map((pick) => (
    <PickCard key={pick.id} pick={pick} />
  ))}
</div>
```

---

## 🛡️ RLS Gotchas

### `special_role` uniqueness error
When creating/updating a pick with a `special_role`, catch duplicate constraint errors:

```tsx
try {
  await createPick({ ...data, special_role: 'favorite' });
} catch (err) {
  if (err.message.includes('picks_active_special_role_unique')) {
    alert('You already have an active pick with that special role. Deactivate the existing one first.');
  } else {
    alert(`Error: ${err.message}`);
  }
}
```

### Manager-only operations
API helpers respect RLS automatically:
```tsx
// This will fail for non-managers via RLS
await createBudtender({ name: 'New Staff', email: 'staff@example.com', role: 'budtender' });

// This will fail for non-managers via RLS
await deleteBudtender(budtenderId);
```

Show helpful UI before attempting:
```tsx
const { isManager } = useAuth();
if (!isManager) {
  return <p>You don't have permission to manage staff.</p>;
}
```

---

## 🚨 Common Errors & Fixes

### "auth_user_id violates foreign key constraint"
**Problem:** Trying to create a budtender with an `auth_user_id` that doesn't exist in `auth.users`.

**Fix:** Ensure user exists in Supabase Auth first, then create budtender row.

### "cannot read properties of null (reading 'id')"
**Problem:** Accessing `profile.id` before auth context loads.

**Fix:**
```tsx
const { profile, loading } = useAuth();
if (loading) return <Spinner />;
if (!profile) return <Navigate to="/login" />;
// Now safe to use profile.id
```

### "Function not found: auth.uid()"
**Problem:** RLS policy using `auth.uid()` but it's not available (old Supabase versions).

**Fix:** Upgrade Supabase or use `current_setting('request.jwt.claims')::json->>'sub'`.

### Special role constraint error in console
**Problem:** User tries to create second active pick with same `special_role`.

**Fix:** Catch error, show user-friendly message: "Only one active [role] pick allowed. Deactivate the existing one first."

### "White page" / Auth timeout - No Supabase API calls
**Problem:** App shows header/footer but no data loads. Console shows `[Auth] Loading profile...` but never `Profile fetched`. 10-second timeout fires.

**Cause:** `.env.local` file has formatting issues:
- Leading whitespace on lines (e.g., `   VITE_SUPABASE_URL=...`)
- Truncated API key (JWT cut off)
- BOM encoding issues

**Fix:**
1. Check `.env.local` format - no leading/trailing spaces:
   ```bash
   Get-Content ".env.local"
   ```
2. Verify key length (should be ~229 chars for anon key):
   ```bash
   $lines = Get-Content ".env.local"; $lines[1].Length
   ```
3. Rewrite file with clean formatting:
   ```bash
   $content = "VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=..."
   [System.IO.File]::WriteAllText(".env.local", $content, [System.Text.UTF8Encoding]::new($false))
   ```

---

## 📁 File Structure Reference

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Main shell with header/footer
│   │   └── ModeToggle.tsx      # Customer/Staff mode toggle
│   ├── auth/
│   │   └── LoginPage.tsx       # Email + password form
│   ├── budtenders/
│   │   └── (budtender-specific components)
│   ├── picks/
│   │   └── (pick-specific components)
│   └── ui/                     # shadcn components (Button, Card, etc.)
├── contexts/
│   └── AuthContext.tsx         # Centralized auth state
├── lib/
│   ├── supabaseClient.ts       # Supabase client singleton
│   └── api/
│       ├── auth.ts             # getCurrentUserProfile()
│       ├── budtenders.ts       # Budtender CRUD
│       ├── categories.ts       # Category queries
│       └── picks.ts            # Pick CRUD
├── views/
│   ├── CustomerView.tsx        # Read-only display mode
│   ├── StaffView.tsx           # Edit mode
│   └── StaffManagementView.tsx # Manager-only staff CRUD
├── types/
│   ├── database.ts             # Generated Supabase types
│   └── index.ts                # Barrel exports
└── styles/
    └── theme.css               # Radix Colors semantic tokens
```

---

## 🔧 Commands

```bash
# Dev server
npm run dev

# Type check
npm run build  # (also runs tsc)

# Lint
npm run lint

# Preview production build
npm run preview

# Generate Supabase types (via MCP in Cursor)
# Use: mcp_supabase_generate_typescript_types tool
```

---

## 🌐 Environment Setup

Create `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Never commit `.env.local`** (already in `.gitignore`)

---

## 📚 Documentation Map

| Question | See |
|----------|-----|
| What is Guidelight? | `README.md` |
| Full product spec? | `docs/GUIDELIGHT_SPEC.md` |
| Architecture decisions? | `docs/ARCHITECTURE_OVERVIEW.md` |
| Design tokens? | `docs/GUIDELIGHT_DESIGN_SYSTEM.md` |
| Implementation steps? | `notes/GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md` |
| Daily progress? | `notes/GUIDELIGHT_MVP_PROGRESS.md` |
| Why did we decide X? | `notes/MVP_CRITICAL_DECISIONS.md` |

---

**Last Updated:** 2025-11-25

