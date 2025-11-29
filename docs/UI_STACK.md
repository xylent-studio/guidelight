# Guidelight UI Stack

> Quick reference for styling, components, and design patterns in Guidelight.

**Last updated:** November 2025  
**Related:** [Design System](./GUIDELIGHT_DESIGN_SYSTEM.md) | [Architecture](./ARCHITECTURE_OVERVIEW.md)

---

## 1. Library Inventory

| Library | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **shadcn/ui** | latest | Composable component primitives (new-york style) |
| **Radix UI** | varies | Accessible, unstyled primitives (via shadcn) |
| **lucide-react** | 0.554+ | Icon library |
| **class-variance-authority** | 0.7+ | Component variant management |
| **tailwind-merge** | 3.4+ | Smart class merging |
| **tw-animate-css** | 1.4+ | Animation utilities |
| **sonner** | 2.x | Toast notifications |

### Why These?

- **Tailwind + shadcn** — Industry-standard combo. shadcn gives us accessible, well-designed components that we fully own and can customize.
- **Radix** — Under the hood of shadcn. Handles keyboard nav, focus management, ARIA.
- **Lucide** — Consistent icon style, tree-shakeable, React-native.
- **Sonner** — Best-in-class toasts with minimal config.

---

## 2. Installed Components

Components live in `src/components/ui/`. These are shadcn/ui components that have been installed:

| Component | File | Notes |
|-----------|------|-------|
| Badge | `badge.tsx` | Status indicators, tags |
| Button | `button.tsx` | Primary, outline, ghost, link variants |
| Card | `card.tsx` | Container with header/content/footer |
| Dialog | `dialog.tsx` | Modal dialogs |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Select | `select.tsx` | Dropdown selects |
| Switch | `switch.tsx` | Toggle switches |
| Tabs | `tabs.tsx` | Tab navigation |
| Textarea | `textarea.tsx` | Multi-line text inputs |

### Guidelight-Specific Components

| Component | File | Notes |
|-----------|------|-------|
| StarRating | `star-rating.tsx` | 5-star display/input with half-star support |
| PasswordInput | `password-input.tsx` | Input with show/hide toggle |
| ThemeToggle | `theme-toggle.tsx` | Light/System/Dark mode switcher |

### Missing Components (Add As Needed)

Some shadcn components we haven't installed yet:

- `DropdownMenu` — For action menus
- `Sheet` — Slide-out panels (mobile nav)
- `Tooltip` — Hover hints
- `AlertDialog` — Confirm/cancel dialogs (currently using native `confirm()`)
- `Skeleton` — Loading placeholders

Install with: `npx shadcn@latest add <component>`

---

## 3. Color Token System

We use **shadcn's standard token names**. These are defined in `src/index.css` and work automatically with Tailwind:

### Primary Tokens (Most Used)

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Primary text |
| `--card` | `bg-card` | Card/surface backgrounds |
| `--card-foreground` | `text-card-foreground` | Text on cards |
| `--muted` | `bg-muted` | Subtle backgrounds, elevated areas |
| `--muted-foreground` | `text-muted-foreground` | Secondary text |
| `--border` | `border-border` | Border color |
| `--primary` | `bg-primary`, `text-primary` | Brand color, CTAs |
| `--accent` | `bg-accent` | Selected states, highlights |

### Guidelight Extensions

These tokens extend shadcn for domain-specific needs (defined in `src/styles/theme.css`):

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `--gl-star-filled` | `text-star-filled` | Filled star rating |
| `--gl-star-half` | `text-star-half` | Half star |
| `--gl-star-empty` | `text-star-empty` | Empty star |
| `--gl-chip-selected-*` | `bg-chip-selected-bg` etc. | Selected category chip |
| `--gl-chip-unselected-*` | `bg-chip-unselected-bg` etc. | Unselected chip |
| `--gl-btn-*` | `bg-btn-primary-bg` etc. | Button color overrides |

### Rule: Use Semantic Tokens, Never Raw Colors

```tsx
// ✅ Good
<div className="bg-background text-foreground border-border">

// ❌ Bad
<div className="bg-white text-gray-900 border-gray-200">
<div style={{ backgroundColor: '#f5f5f5' }}>
```

---

## 4. Shape Language

| Element | Border Radius | Token |
|---------|---------------|-------|
| Cards | 16px | `rounded-xl` |
| Buttons | 6px | `rounded-md` |
| Inputs | 6px | `rounded-md` |
| Pills/Chips | Full | `rounded-full` |
| Dialogs | 12px | `rounded-lg` |

---

## 5. Usage Rules

### Always Use shadcn Components

For standard UI elements, use the installed shadcn components:

```tsx
// ✅ Good
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// ❌ Bad
<button className="px-4 py-2 bg-primary rounded">Click me</button>
```

### Build on Top for Custom Needs

For domain-specific components, build on shadcn primitives:

```tsx
// StarRating builds on base styles
// FeedbackModal uses Dialog from shadcn
// PickFormModal uses Dialog, Input, Select, etc.
```

### Dark Mode

- All components automatically support dark mode via CSS variables
- Use semantic tokens and they'll adapt
- Test both modes when adding new UI

### Adding New Components

1. **Check if shadcn has it:** `npx shadcn@latest add <component>`
2. **Components go in:** `src/components/ui/`
3. **Use semantic tokens** for any color references
4. **Export from component file** and import with `@/components/ui/`

---

## 6. Quick Reference

### Common Patterns

```tsx
// Page background
<div className="min-h-screen bg-background">

// Card
<Card className="bg-card border-border">

// Primary text
<h1 className="text-foreground">

// Secondary text
<p className="text-muted-foreground">

// Elevated/muted area
<div className="bg-muted border border-border rounded-lg">

// Selected state
<div className="bg-accent border-primary">

// Primary button (use component)
<Button variant="default">Save</Button>

// Outline button
<Button variant="outline">Cancel</Button>
```

### Import Aliases

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'  // Class name merger
```

---

## 7. Resources

- **shadcn/ui docs:** https://ui.shadcn.com
- **Tailwind docs:** https://tailwindcss.com
- **Lucide icons:** https://lucide.dev
- **Radix docs:** https://www.radix-ui.com





