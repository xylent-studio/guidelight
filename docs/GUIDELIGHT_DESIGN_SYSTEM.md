# Guidelight Design System (Draft)

Guidelight’s UI layer is built with **Tailwind CSS**, **shadcn/ui**, and **Radix Colors** to ensure consistent, accessible styling across Staff and Customer views. This document is the **single source of truth** for all design tokens (colors, typography, spacing, radii, shadows) and the shared component patterns that keep the app POS-friendly. Every screen should follow the POS constraints described in `GUIDELIGHT_SPEC.md` and `ARCHITECTURE_OVERVIEW.md`: large tap targets, high contrast, and clean card-based layouts that remain readable on 1920×1080 kiosks and responsive devices.

## Outline

### 1. Colors

#### Base Scales (Radix Colors)

Guidelight uses two core Radix color scales:

- **Neutrals:** `slate` – Clean, professional, and POS-friendly for backgrounds, surfaces, and text.
- **Primary:** `jade` – Cannabis-appropriate emerald/green that remains calm and readable, never neon.

These scales provide semantic tokens via CSS variables (`--gl-*`) that can be reused across future Xylent apps.

#### Semantic Token Reference

| Token | CSS Variable | Usage |
|-------|--------------|-------|
| **bg** | `--gl-bg` | Main background color (full-page backdrop) |
| **bg-soft** | `--gl-bg-soft` | Slightly raised background (subtle sections) |
| **surface** | `--gl-surface` | Card and panel backgrounds |
| **border** | `--gl-border` | Default border color for cards, inputs, dividers |
| **text** | `--gl-text` | Primary text color (high contrast) |
| **text-muted** | `--gl-text-muted` | Secondary/muted text (labels, captions) |
| **primary** | `--gl-primary` | Main brand accent (buttons, links, active states) |
| **primary-soft** | `--gl-primary-soft` | Subtle primary tint (hover backgrounds, highlights) |
| **primary-foreground** | `--gl-primary-foreground` | Text/icon color on primary backgrounds |
| **accent** | `--gl-accent` | Highlight color (interactive elements, badges) |

#### Tailwind Usage

These tokens are exposed as Tailwind utility classes:

```tsx
<div className="bg-surface border-border text-text">
  <h2 className="text-primary">Staff Picks</h2>
  <p className="text-text-muted">Browse our recommendations</p>
  <button className="bg-primary text-primary-foreground">View All</button>
</div>
```

#### Radix Base Values

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--gl-bg` | `var(--slate-1)` | `var(--slate-1)` |
| `--gl-bg-soft` | `var(--slate-2)` | `var(--slate-2)` |
| `--gl-surface` | `var(--slate-3)` | `var(--slate-3)` |
| `--gl-border` | `var(--slate-6)` | `var(--slate-6)` |
| `--gl-text` | `var(--slate-12)` | `var(--slate-12)` |
| `--gl-text-muted` | `var(--slate-11)` | `var(--slate-11)` |
| `--gl-primary` | `var(--jade-9)` | `var(--jade-9)` |
| `--gl-primary-soft` | `var(--jade-4)` | `var(--jade-4)` |
| `--gl-primary-foreground` | `var(--slate-1)` | `var(--slate-1)` |
| `--gl-accent` | `var(--jade-11)` | `var(--jade-11)` |

All tokens are defined in `src/styles/theme.css` and imported globally via `src/index.css`.

---

### 2. Typography

**Font Stack:**
- Primary: System UI fonts (matches device defaults for optimal rendering)
- Fallback: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Type Scale (Tailwind classes used in the app):**

| Purpose | Tailwind Class | Font Size | Usage |
|---------|----------------|-----------|-------|
| **Eyebrow labels** | `text-xs` | 0.75rem (12px) | Uppercase section headers, metadata |
| **Helper text** | `text-sm` | 0.875rem (14px) | Form hints, captions, muted descriptions |
| **Body text** | `text-base` | 1rem (16px) | Default paragraph text, form labels |
| **Card titles** | `text-lg` | 1.125rem (18px) | Category headers, pick card subtitles |
| **Section headers** | `text-xl` | 1.25rem (20px) | Card headers, form section titles |
| **Page titles** | `text-2xl` | 1.5rem (24px) | Staff View page titles |
| **Hero titles** | `text-3xl` | 1.875rem (30px) | App shell main heading |

**Weights:**
- `font-normal` (400) – body text, descriptions
- `font-semibold` (600) – labels, eyebrows, button text
- `font-bold` (700) – headings, product names

**Line Heights:**
- `leading-relaxed` (1.625) – body paragraphs for readability
- `leading-tight` (1.25) – headings

**Case & Tracking:**
- `uppercase tracking-wider` – eyebrow labels for visual hierarchy

---

### 3. Spacing

Guidelight uses Tailwind's default spacing scale (0.25rem increments, 4px base):

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 0.5rem (8px) | Badge clusters, tight inline groups |
| `gap-3` | 0.75rem (12px) | Grid gaps for buttons, pick cards |
| `gap-4` | 1rem (16px) | Form field spacing, card content sections |
| `gap-5` | 1.25rem (20px) | Header sections, large card groups |
| `gap-6` | 1.5rem (24px) | Major layout sections (Customer/Staff view) |
| `gap-8` | 2rem (32px) | Top-level app shell sections |
| `px-4` | 1rem (16px) | Mobile horizontal padding |
| `px-5` | 1.25rem (20px) | Card horizontal padding |
| `py-4` | 1rem (16px) | Button vertical padding, card content |
| `py-10` | 2.5rem (40px) | App shell vertical padding |

**POS Touch Targets:**
- Minimum button height: `py-4` (provides ~48px tap target with text)
- Form inputs: `h-10` or larger (40px minimum)
- Card padding: `p-4` to `p-6` for comfortable spacing

---

### 4. Radii (Border Radius)

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 0.25rem (4px) | Inline code tags, small badges |
| `rounded-md` | 0.375rem (6px) | Inputs, selects, textareas |
| `rounded-lg` | 0.5rem (8px) | Cards, pick cards, buttons |
| `rounded-xl` | 0.75rem (12px) | Larger cards, modal containers (future) |

**Implementation:**
- Cards use `rounded-lg` by default
- shadcn components inherit appropriate radii from Tailwind config
- Buttons and inputs use `rounded-md` for clean, POS-friendly aesthetics

---

### 5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| None | Default | Most cards rely on borders (`border-border`) rather than shadows for definition |
| `hover:shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle hover lift on interactive cards (future enhancement) |
| Future: elevation system | TBD | May add card shadows for Customer View depth if needed |

**Current approach:**
- Guidelight prioritizes **borders over shadows** for POS clarity
- High contrast borders (`border-border`) ensure elements are visible in varying lighting
- Hover states use `border-primary` color transitions instead of shadow changes

---

### 6. Components

All UI components are built with **shadcn/ui** (Radix primitives + Tailwind styling) and live in `src/components/ui/`.

**Core Components in Use:**

| Component | Usage | Key Props/Classes |
|-----------|-------|-------------------|
| **Button** | Mode toggles, CTAs, form actions | `variant="default"` (primary), `variant="outline"` (secondary), `size="lg"` for POS |
| **Card** | Pick cards, category sections, form containers | `bg-surface`, `border-border`, hover states with `hover:border-primary` |
| **Input** | Product name, brand, rank | `bg-bg` for subtle background, `border-border` |
| **Label** | Form field labels | `text-text` or `text-text-muted`, paired with inputs |
| **Textarea** | "Why I love it" field | `resize-none`, `rows={3}`, `bg-bg` |
| **Select** | Dropdowns for category, product type, time of day | `bg-bg`, full-width on mobile |
| **Switch** | Active toggles for picks | `checked` state, paired with Label |
| **Badge** | Effect tags, special roles | `variant="secondary"` with `bg-primary-soft`, `text-xs` |
| **Tabs** | Category navigation in Customer View | Active tab uses `bg-primary text-primary-foreground` |

**Composition Patterns:**
- **Pick Cards (Customer View):**
  ```tsx
  <Card className="bg-surface border-border hover:border-primary transition-colors">
    <CardHeader>
      <CardTitle className="text-xl text-text">Product Name</CardTitle>
      <p className="text-sm text-text-muted">Brand</p>
    </CardHeader>
    <CardContent className="space-y-3">
      {/* Badges, quote, metadata */}
    </CardContent>
  </Card>
  ```

- **Form Fields (Staff View):**
  ```tsx
  <div className="space-y-2">
    <Label htmlFor="field">Field Label</Label>
    <Input id="field" className="bg-bg" />
    <p className="text-xs text-text-muted">Helper text</p>
  </div>
  ```

**Responsive Breakpoints:**
- `sm:` 640px – Stack to 2 columns
- `md:` 768px – 2-column pick grid
- `lg:` 1024px – 3-column pick grid (POS optimal)

**POS-Specific Constraints:**
- Customer View on desktop (lg+): Fixed layout, 3-column grid, ~6-9 cards visible
- Staff View: Always scrollable, comfortable on any device
- All touch targets ≥44px for accessibility

---

## Implementation Notes

1. **Theme Adjustments:**
   - To change contrast, edit `src/styles/theme.css` Radix scale steps
   - To swap primary color, replace `jade` imports with another Radix scale (e.g., `green`, `teal`)
   - Changes propagate automatically via CSS variables → Tailwind utilities

2. **Adding Components:**
   - Install via `npx shadcn@latest add <component>`
   - Components auto-configure with our theme tokens

3. **Custom Styling:**
   - Use Tailwind utilities first
   - For one-off tweaks, add inline classes
   - Avoid custom CSS files; keep styling in JSX

4. **Future Enhancements:**
   - Multi-select component for effect tags
   - Photo upload for budtender profiles
   - Drag-to-reorder for pick ranking
   - Toast notifications for save/error states 

