# Session 12: Visible Fields System

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 3 - Pick Drafts Layer |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 11 completed |
| **Output** | Eye toggles in PickFormModal, visible_fields on customer cards |

---

## Pre-Session Checklist

- [ ] Session 11 completed successfully
- [ ] `picks.visible_fields` column exists from Session 02
- [ ] Read `CONFLICTS_AND_DECISIONS.md` for visible_fields semantics

---

## Session Goals

1. Add eye toggle icons to PickFormModal fields
2. Store visible_fields in pick data
3. Update GuestPickCard to respect visible_fields
4. Update Show-to-Customer overlay to respect visible_fields

---

## visible_fields Semantics (from CONFLICTS_AND_DECISIONS.md)

- **Type**: `text[]` with known field keys
- **NULL behavior**: UI uses sensible defaults (NOT "hide everything")
- **Known keys**: `one_liner`, `why_i_love_it`, `effect_tags`, `deal_badge`, `time_of_day`, `rating`, `potency_summary`, `intensity`, `experience_level`, `budget_level`, `package_size`, `top_terpenes`
- **Default visible** (when NULL): product_name, brand, product_type, one_liner, time_of_day, effect_tags, rating, potency_summary

---

## Acceptance Criteria

- [ ] Eye icon next to each toggleable field in PickFormModal
- [ ] Clicking eye toggles field in/out of visible_fields array
- [ ] visible_fields saved with pick
- [ ] GuestPickCard hides fields not in visible_fields
- [ ] Show-to-Customer overlay respects visible_fields
- [ ] NULL visible_fields shows default fields
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Define toggleable fields constant

Create or update `src/lib/constants/visibleFields.ts`:

```typescript
export const TOGGLEABLE_FIELDS = [
  { key: 'one_liner', label: 'One-liner' },
  { key: 'why_i_love_it', label: 'Why I love it' },
  { key: 'effect_tags', label: 'Effect tags' },
  { key: 'time_of_day', label: 'Time of day' },
  { key: 'rating', label: 'Rating' },
  { key: 'potency_summary', label: 'Potency' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'experience_level', label: 'Experience level' },
  { key: 'budget_level', label: 'Budget level' },
  { key: 'package_size', label: 'Package size' },
  { key: 'top_terpenes', label: 'Top terpenes' },
  { key: 'deal_badge', label: 'Deal badge' },
] as const;

export type ToggleableFieldKey = typeof TOGGLEABLE_FIELDS[number]['key'];

export const DEFAULT_VISIBLE_FIELDS: ToggleableFieldKey[] = [
  'one_liner',
  'time_of_day',
  'effect_tags',
  'rating',
  'potency_summary',
];

/**
 * Get visible fields, falling back to defaults if null
 */
export function getVisibleFields(visibleFields: string[] | null): ToggleableFieldKey[] {
  if (!visibleFields) {
    return DEFAULT_VISIBLE_FIELDS;
  }
  return visibleFields as ToggleableFieldKey[];
}

/**
 * Check if a field should be visible
 */
export function isFieldVisible(fieldKey: ToggleableFieldKey, visibleFields: string[] | null): boolean {
  const fields = getVisibleFields(visibleFields);
  return fields.includes(fieldKey);
}
```

### Step 2: Create FieldVisibilityToggle component

Create `src/components/picks/FieldVisibilityToggle.tsx`:

```typescript
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type FieldVisibilityToggleProps = {
  fieldKey: string;
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function FieldVisibilityToggle({ fieldKey, isVisible, onToggle, disabled }: FieldVisibilityToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggle}
            disabled={disabled}
          >
            {isVisible ? (
              <Eye size={14} className="text-muted-foreground" />
            ) : (
              <EyeOff size={14} className="text-muted-foreground/50" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isVisible ? 'Visible to customers' : 'Hidden from customers'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### Step 3: Update PickFormModal with eye toggles

```typescript
// In PickFormModal.tsx
import { FieldVisibilityToggle } from './FieldVisibilityToggle';
import { TOGGLEABLE_FIELDS, isFieldVisible, ToggleableFieldKey } from '@/lib/constants/visibleFields';

// Add to form state
const [visibleFields, setVisibleFields] = useState<string[]>(
  pick?.visible_fields || []  // null means use defaults
);

const toggleFieldVisibility = (fieldKey: ToggleableFieldKey) => {
  setVisibleFields(current => {
    if (current.includes(fieldKey)) {
      return current.filter(k => k !== fieldKey);
    } else {
      return [...current, fieldKey];
    }
  });
};

// Example usage next to a field:
<div className="flex items-center gap-2">
  <Label>One-liner</Label>
  <FieldVisibilityToggle
    fieldKey="one_liner"
    isVisible={isFieldVisible('one_liner', visibleFields)}
    onToggle={() => toggleFieldVisibility('one_liner')}
  />
</div>
<Input
  value={formData.one_liner}
  onChange={(e) => updateField('one_liner', e.target.value)}
  placeholder="Brief description..."
/>
```

### Step 4: Update GuestPickCard to respect visible_fields

```typescript
// In GuestPickCard.tsx
import { isFieldVisible } from '@/lib/constants/visibleFields';

type GuestPickCardProps = {
  pick: Pick;
  onClick?: () => void;
};

export function GuestPickCard({ pick, onClick }: GuestPickCardProps) {
  const showOneLiner = isFieldVisible('one_liner', pick.visible_fields);
  const showRating = isFieldVisible('rating', pick.visible_fields);
  const showEffectTags = isFieldVisible('effect_tags', pick.visible_fields);
  const showTimeOfDay = isFieldVisible('time_of_day', pick.visible_fields);
  // ... etc

  return (
    <Card className="..." onClick={onClick}>
      {/* Always show product name and brand */}
      <h3>{pick.product_name}</h3>
      {pick.brand && <p>{pick.brand}</p>}
      
      {/* Conditionally show other fields */}
      {showOneLiner && pick.one_liner && (
        <p>{pick.one_liner}</p>
      )}
      
      {showRating && pick.rating && (
        <div className="flex items-center gap-1">
          <Star size={14} />
          <span>{pick.rating}</span>
        </div>
      )}
      
      {showTimeOfDay && pick.time_of_day && pick.time_of_day !== 'Anytime' && (
        <Badge>{pick.time_of_day}</Badge>
      )}
      
      {showEffectTags && pick.effect_tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {pick.effect_tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}
      
      {/* ... etc */}
    </Card>
  );
}
```

### Step 5: Update Show-to-Customer overlay

Apply same logic to `ShowToCustomerOverlay.tsx`.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/constants/visibleFields.ts` | Create |
| `src/components/picks/FieldVisibilityToggle.tsx` | Create |
| `src/components/picks/PickFormModal.tsx` | Add eye toggles |
| `src/components/picks/GuestPickCard.tsx` | Respect visible_fields |
| `src/components/picks/ShowToCustomerOverlay.tsx` | Respect visible_fields |

---

## Canonical Docs to Update

- [ ] `docs/GUIDELIGHT_SPEC.md` - Document visible_fields behavior in Section 2
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/07_UI_PATTERNS_AND_COMPONENTS.md` - Mark eye toggles as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test toggling field visibility
- [ ] Test customer view shows/hides correct fields
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove new constants file and component
2. Revert changes to PickFormModal and card components

---

## Next Session

→ **Session 13: Display Mode Board Support**

