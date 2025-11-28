# Guidelight Design System

**Last Updated:** 2025-11-28  
**Version:** 1.5.0

Guidelight's UI layer is built with **Tailwind CSS**, **shadcn/ui**, and a **custom HSL color system** to ensure consistent, accessible styling across Staff and Customer views. This document is the **single source of truth** for all design tokens (colors, typography, spacing, radii, shadows) and the shared component patterns that keep the app POS-friendly.

> **Quick Links:**  
> - [UI Stack Reference](./UI_STACK.md) — Component library, usage patterns  
> - [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) — System structure

---

## 1. Design Philosophy

Guidelight's visual identity is built on four pillars:

| Pillar | Description |
|--------|-------------|
| **Forest Green (Hue 155)** | Natural leaf green — unmistakably cannabis, never neon |
| **Warm Cream Neutrals** | Premium, organic feel (not clinical white) |
| **Gold/Champagne Accents** | Elevated, dispensary luxury for ratings and highlights |
| **Green-Tinted Dark Mode** | Brand DNA in every shade — Spotify-level richness |

The palette draws inspiration from **premium dispensary aesthetics** and **modern SaaS applications** (Spotify dark mode, Linear, Notion) while maintaining the calm, approachable vibe appropriate for a cannabis retail environment.

---

## 2. Color System

### 2.1 Architecture

Colors are defined as **HSL triplets** in `src/styles/theme.css` and exposed to Tailwind via CSS variables. This approach enables:

- **Theme switching** (light/dark/system) without rebuilding
- **Alpha value support** (`bg-primary/50` for 50% opacity)
- **Consistent brand DNA** across both themes (same hue families)

```css
/* Example usage */
background: hsl(var(--gl-bg-app) / 1);
color: hsl(var(--gl-text-default) / 0.8);
```

### 2.2 Light Mode Palette (Primary Experience)

Light mode is the **default** experience, optimized for dispensary environments with good lighting.

#### Backgrounds — Warm Cream Ramp

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-bg-app` | `40 30% 97%` | Main app shell background |
| `--gl-bg-surface` | `40 20% 99%` | Cards, panels (near-white with warmth) |
| `--gl-bg-elevated` | `40 25% 94%` | Lifted surfaces, hover states |

#### Primary — Forest Green (Hue 155)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-primary` | `155 50% 32%` | Buttons, links, active indicators |
| `--gl-primary-hover` | `155 55% 26%` | Hover state |
| `--gl-primary-active` | `155 58% 22%` | Pressed/active state |
| `--gl-primary-soft` | `155 35% 91%` | Selected backgrounds, chips |
| `--gl-primary-soft-hover` | `155 40% 87%` | Hover on selected items |
| `--gl-primary-outline` | `155 50% 32%` | Focus rings |

#### Text — Warm Near-Blacks

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-text-default` | `35 15% 18%` | Primary body text |
| `--gl-text-muted` | `35 10% 42%` | Secondary labels, captions |
| `--gl-text-disabled` | `35 8% 62%` | Disabled states, placeholders |

#### Borders — Cream-Tinted

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-border-subtle` | `40 15% 86%` | Card borders, dividers |
| `--gl-border-strong` | `40 18% 75%` | Emphasized borders |

#### Stars — Rich Gold

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-star-filled` | `45 95% 52%` | Filled star icons |
| `--gl-star-half` | `45 85% 45%` | Half-filled stars |
| `--gl-star-empty` | `40 20% 82%` | Empty star outlines |

### 2.3 Dark Mode Palette (Green-Tinted Spotify Style)

Dark mode maintains brand DNA by infusing forest green into neutral surfaces.

#### Backgrounds — Forest-Tinted Blacks

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-bg-app` | `155 20% 7%` | Deep forest-black shell |
| `--gl-bg-surface` | `155 15% 11%` | Cards (charcoal with green) |
| `--gl-bg-elevated` | `155 12% 16%` | Lifted surfaces |

#### Primary — Vibrant Forest (Brighter for Dark)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-primary` | `155 55% 48%` | Vibrant forest green |
| `--gl-primary-hover` | `155 58% 42%` | Hover state |
| `--gl-primary-active` | `155 60% 38%` | Pressed state |
| `--gl-primary-soft` | `155 40% 18%` | Deep forest selection |
| `--gl-primary-soft-hover` | `155 45% 22%` | Hover on selected |
| `--gl-primary-outline` | `155 60% 55%` | Focus rings (brighter) |

#### Text — Cream Whites

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-text-default` | `40 8% 96%` | Cream-white text |
| `--gl-text-muted` | `40 5% 68%` | Warm gray |
| `--gl-text-disabled` | `40 4% 48%` | Dim warm gray |

#### Borders — Green-Tinted

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-border-subtle` | `155 12% 22%` | Forest-tinted borders |
| `--gl-border-strong` | `155 15% 32%` | Stronger green tint |

#### Stars — Gold Pops on Dark

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--gl-star-filled` | `45 95% 55%` | Bright gold |
| `--gl-star-half` | `45 88% 48%` | Rich gold |
| `--gl-star-empty` | `45 25% 28%` | Muted gold |

### 2.4 Semantic Token Reference

These tokens are derived from the base palette and used for specific UI patterns:

| Token Group | Light Mode | Dark Mode | Usage |
|-------------|------------|-----------|-------|
| **Navigation** | | | |
| `--gl-nav-bg` | `var(--gl-bg-surface)` | `var(--gl-bg-surface)` | Nav bar background |
| `--gl-nav-item-active-bg` | `var(--gl-primary-soft)` | `var(--gl-primary-soft)` | Active nav item |
| `--gl-nav-item-active-text` | `var(--gl-text-default)` | `var(--gl-text-default)` | Active nav text |
| `--gl-nav-item-inactive-text` | `var(--gl-text-muted)` | `var(--gl-text-muted)` | Inactive nav text |
| **Chips/Pills** | | | |
| `--gl-chip-selected-bg` | `var(--gl-primary-soft)` | `var(--gl-primary-soft)` | Selected chip fill |
| `--gl-chip-selected-border` | `155 40% 75%` | `155 45% 35%` | Selected chip stroke |
| `--gl-chip-selected-text` | `var(--gl-text-default)` | `var(--gl-text-default)` | Selected chip label |
| `--gl-chip-unselected-bg` | `var(--gl-bg-surface)` | `var(--gl-bg-surface)` | Unselected chip |
| `--gl-chip-unselected-border` | `var(--gl-border-subtle)` | `var(--gl-border-subtle)` | Unselected stroke |
| `--gl-chip-unselected-text` | `var(--gl-text-muted)` | `var(--gl-text-muted)` | Unselected label |
| **Buttons** | | | |
| `--gl-btn-primary-bg` | `var(--gl-primary)` | `var(--gl-primary)` | Primary button fill |
| `--gl-btn-primary-text` | `40 20% 99%` | `155 20% 7%` | Primary button text |
| `--gl-btn-ghost-bg-hover` | `155 25% 94%` | `155 30% 14%` | Ghost button hover |

### 2.5 Tailwind Usage

We use **shadcn's standard token names** for consistency. Colors are mapped in `src/index.css`:

```tsx
// Backgrounds (shadcn standard)
<div className="bg-background">      {/* App shell */}
<div className="bg-card">            {/* Cards, surfaces */}
<div className="bg-muted">           {/* Elevated/muted panels */}

// Text (shadcn standard)
<p className="text-foreground">      {/* Primary text */}
<p className="text-muted-foreground">{/* Secondary text */}

// Primary colors
<Button variant="default">           {/* Primary button - use component */}
<div className="bg-accent">          {/* Selected state */}

// Borders
<div className="border-border">      {/* Standard border */}

// Stars (Guidelight-specific)
<Star className="text-star-filled" />
<Star className="text-star-half" />
<Star className="text-star-empty" />

// Category Chips (Guidelight-specific)
<div className="bg-chip-selected-bg border-chip-selected-border">
<div className="bg-chip-unselected-bg border-chip-unselected-border">

// With alpha values
<div className="bg-primary/50">      {/* 50% opacity */}
<div className="border-border/80">
```

> **See also:** [`docs/UI_STACK.md`](./UI_STACK.md) for the complete component reference.

### 2.6 Theme Implementation

#### Theme Context (`src/contexts/ThemeContext.tsx`)

```tsx
type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>();
```

- Persists preference to `localStorage` under key `guidelight-theme`
- Applies `data-theme="light|dark"` attribute to `<html>` element
- Defaults to **light mode** on first visit
- System preference detected via `window.matchMedia('(prefers-color-scheme: dark)')`

#### Theme Toggle (`src/components/ui/theme-toggle.tsx`)

- Located in app footer, **staff-only** (hidden in Customer View)
- Three options: Light (sun icon) / System (monitor) / Dark (moon)
- Radio group pattern for accessibility

---

## 3. Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

System fonts ensure optimal rendering and performance across devices.

### Type Scale

| Purpose | Tailwind | Size | Weight | Usage |
|---------|----------|------|--------|-------|
| Eyebrow | `text-xs` | 12px | 600 | Uppercase section labels |
| Helper | `text-sm` | 14px | 400 | Form hints, captions |
| Body | `text-base` | 16px | 400 | Default paragraph text |
| Card Title | `text-lg` | 18px | 600 | Product names, subtitles |
| Section | `text-xl` | 20px | 700 | Card headers |
| Page Title | `text-2xl` | 24px | 700 | Staff View titles |
| Hero | `text-3xl` | 30px | 700 | App landing headline |

### Line Heights

- `leading-relaxed` (1.625) — body paragraphs
- `leading-tight` (1.25) — headings

---

## 4. Spacing

Tailwind's default 4px scale:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Badge clusters, tight groups |
| `gap-3` | 12px | Grid gaps, button groups |
| `gap-4` | 16px | Form fields, card sections |
| `gap-6` | 24px | Major layout sections |
| `gap-8` | 32px | App shell sections |
| `px-4` | 16px | Mobile horizontal padding |
| `py-4` | 16px | Button vertical padding |

### POS Touch Targets

- Minimum button height: `py-4` (~48px with text)
- Form inputs: `h-10` minimum (40px)
- Card tap areas: `p-4` to `p-6`

---

## 5. Radii (Border Radius)

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Small badges, inline code |
| `rounded-md` | 6px | Inputs, selects |
| `rounded-lg` | 8px | Cards, buttons |
| `rounded-xl` | 12px | Modal containers |

---

## 6. Shadows

Guidelight prioritizes **borders over shadows** for POS clarity in varying lighting:

| Context | Treatment |
|---------|-----------|
| Default | `border-border-subtle` (no shadow) |
| Hover | `border-primary` color transition |
| Focus | `ring-2 ring-primary-outline` |
| Future | May add subtle elevation for depth |

---

## 7. Components

Built with **shadcn/ui** (Radix primitives + Tailwind):

### Core Components

| Component | Location | Key Classes |
|-----------|----------|-------------|
| Button | `src/components/ui/button.tsx` | `bg-btn-primary-bg`, `text-btn-primary-text` |
| Card | `src/components/ui/card.tsx` | `bg-bg-surface`, `border-border-subtle` |
| StarRating | `src/components/ui/star-rating.tsx` | `text-star-filled`, `text-star-half`, `text-star-empty` |
| ThemeToggle | `src/components/ui/theme-toggle.tsx` | Radio group with icons |

### Composition Patterns

**Pick Card (Customer View):**
```tsx
<Card className="bg-card border-border hover:border-primary transition-colors">
  <CardHeader>
    <CardTitle className="text-foreground">Product Name</CardTitle>
    <StarRating value={4.5} readonly />
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Brand • Category</p>
  </CardContent>
</Card>
```

**Selected Chip:**
```tsx
<button className={cn(
  "border rounded-lg px-4 py-2",
  isSelected 
    ? "bg-chip-selected-bg border-chip-selected-border text-chip-selected-text"
    : "bg-chip-unselected-bg border-chip-unselected-border text-chip-unselected-text"
)}>
  {label}
</button>
```

> **Note:** For standard UI elements (buttons, cards, inputs), always use the installed shadcn components. See [`docs/UI_STACK.md`](./UI_STACK.md) for the full component catalog.

---

## 8. Icons

Using **Lucide React** (same as shadcn/ui):

```tsx
import { Plus, Pencil, Star, Sun, Moon, Monitor } from 'lucide-react';
```

### Size Conventions

| Context | Size | Example |
|---------|------|---------|
| Inline with text | `16px` | Button labels |
| Standalone small | `20px` | Icon-only buttons |
| Standalone large | `24px` | Empty states |

### Accessibility

- Icon-only buttons **must** have `aria-label`
- Icons inherit `currentColor` — no separate color needed

---

## 9. Voice & Tone

Guidelight is **friendly, helpful, and a little playful**.

### Principles

1. **Helpful, not bossy** — guide users, don't command
2. **Warm, not corporate** — sound like a person
3. **Playful, not silly** — light touch, appropriate for cannabis

### Examples

| Context | Instead of | Write |
|---------|------------|-------|
| Empty state | "No picks found" | "No picks yet. Add one to get started." |
| Success | "Profile updated" | "Profile saved! Looking good." |
| Error | "Invalid input" | "Something's not quite right. Check the highlighted fields?" |

---

## 10. Files Reference

| File | Purpose |
|------|---------|
| `src/styles/theme.css` | HSL color token definitions |
| `tailwind.config.js` | Tailwind color utility mapping |
| `src/contexts/ThemeContext.tsx` | Theme state management |
| `src/components/ui/theme-toggle.tsx` | Theme switcher component |
| `src/components/ui/star-rating.tsx` | 5-star rating display/input |
| `src/components/ui/button.tsx` | Button variants with theme tokens |

---

## 11. Adding New Colors

When you need a new state or variation:

1. **Don't use ad-hoc hex colors** in components
2. **Derive from existing tokens** by adjusting lightness (±4%) or saturation (±5%)
3. **Add as a new CSS variable** in `theme.css`
4. **Expose via Tailwind** in `tailwind.config.js`
5. **Document here** with usage context

**Example:** Need a warning state?
```css
/* In theme.css */
--gl-warning: 45 90% 50%;        /* Gold-ish, derived from star-filled hue */
--gl-warning-soft: 45 60% 92%;   /* Light background */
```

---

**Questions?** Ask Justin or file an issue in the repository.
