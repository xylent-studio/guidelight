# Budtender Picks Board – Technical Design
*Xylent Studios – Guidelight*

---

## 1. Scope

This document describes how to implement the **Budtender Picks Board** as a reusable template view in Guidelight.

Key points:

- One **generic board layout**, parameterized by budtender.
- Justin is the first budtender using it, but the board is not Justin-specific.
- Data is sourced from existing Guidelight tables (`budtenders`, `picks`) with minimal additions.
- Implementation is purely in frontend (React + TS + CSS), talking directly to Supabase.

---

## 2. High-Level Approach

We implement a **generic React view**:

```tsx
<BudtenderBoardView budtenderId={...} />
```

or, if route-based:

- `/board/:budtenderSlug` → resolves to a `budtender_id`.

The view:

1. Loads the budtender’s profile.
2. Loads that budtender’s active picks (up to 9) in the desired order.
3. Renders a **BudtenderBoard** component that:
   - Displays `[Name]’s Picks` header.
   - Shows the note bubble (template or override).
   - Renders a 3×3 grid of cards.
   - Optionally shows doodles per card.
   - Shows Xylent Studios signature.

No extra backend, no new service. All data access is via Supabase client.

---

## 3. Data Model

### 3.1 `budtenders` Table

We reuse the existing `budtenders` table (see `GUIDELIGHT_SPEC.md`) and optionally add:

```sql
alter table public.budtenders
  add column if not exists slug text;             -- e.g., 'justin'
alter table public.budtenders
  add column if not exists picks_note_override text;  -- optional board intro
```

- `slug` is optional; used for clean URLs like `/board/justin`.
- `picks_note_override` allows a custom intro note. If null, we use the default template.

### 3.2 `picks` Table

We reuse `picks` for the board content. To support doodles:

```sql
alter table public.picks
  add column if not exists doodle_key text;
```

Recommended columns used by the board:

- `budtender_id` – foreign key to `budtenders`.
- `product_name` – full string shown as the card title.
- `category_line` – short descriptive line (add this column if not already present).
- `why_i_love_it` – text, used as the note on the card.
- `doodle_key` – optional; used to pick a doodle (SVG).
- `rank` – integer; used to order the picks on the board.
- `is_active` – boolean; only active picks appear.

Example alteration for `category_line`:

```sql
alter table public.picks
  add column if not exists category_line text;
```

---

## 4. API Helpers

We add small API helpers under `src/lib/api/`.

### 4.1 `getBudtenderBySlug`

```ts
// src/lib/api/budtenders.ts
import { supabase } from "../supabaseClient";

export type Budtender = {
  id: string;
  name: string;
  slug: string | null;
  picks_note_override: string | null;
};

export async function getBudtenderBySlug(slug: string): Promise<Budtender | null> {
  const { data, error } = await supabase
    .from("budtenders")
    .select("id, name, slug, picks_note_override")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Error loading budtender by slug", error);
    return null;
  }

  return data as Budtender | null;
}
```

### 4.2 `getBoardPicksForBudtender`

```ts
// src/lib/api/picks.ts
import { supabase } from "../supabaseClient";

export type BoardPick = {
  id: string;
  product_name: string;
  category_line: string;
  note: string;
  doodle_key: string | null;
  rank: number;
};

export async function getBoardPicksForBudtender(budtenderId: string): Promise<BoardPick[]> {
  const { data, error } = await supabase
    .from("picks")
    .select("id, product_name, category_line, why_i_love_it, doodle_key, rank")
    .eq("budtender_id", budtenderId)
    .eq("is_active", true)
    .order("rank", { ascending: true })
    .limit(9);

  if (error) {
    console.error("Error loading picks for budtender board", error);
    return [];
  }

  return (
    data?.map((row) => ({
      id: row.id,
      product_name: row.product_name,
      category_line: row.category_line,
      note: row.why_i_love_it,
      doodle_key: row.doodle_key,
      rank: row.rank,
    })) ?? []
  );
}
```

---

## 5. React Components

### 5.1 `BudtenderBoardView`

Entry-point view that wires data loading + layout. Example using react-router:

```tsx
// src/views/BudtenderBoardView.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBudtenderBySlug, Budtender } from "../lib/api/budtenders";
import { getBoardPicksForBudtender, BoardPick } from "../lib/api/picks";
import { BudtenderBoard } from "../components/BudtenderBoard";

export function BudtenderBoardView() {
  const { slug } = useParams<{ slug: string }>();
  const [budtender, setBudtender] = useState<Budtender | null>(null);
  const [picks, setPicks] = useState<BoardPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);

      const bt = await getBudtenderBySlug(slug);
      if (!bt) {
        setBudtender(null);
        setPicks([]);
        setLoading(false);
        return;
      }

      const btPicks = await getBoardPicksForBudtender(bt.id);
      setBudtender(bt);
      setPicks(btPicks);
      setLoading(false);
    })();
  }, [slug]);

  if (!slug) {
    return <div>No budtender specified.</div>;
  }

  if (loading) {
    return <div>Loading picks…</div>;
  }

  if (!budtender) {
    return <div>Budtender not found or inactive.</div>;
  }

  if (!picks.length) {
    return (
      <div>
        <h1>{budtender.name}&apos;s Picks</h1>
        <p>No picks yet – ask {budtender.name} to set up their favorites in Guidelight.</p>
      </div>
    );
  }

  return <BudtenderBoard budtender={budtender} picks={picks} />;
}
```

### 5.2 `BudtenderBoard`

Pure layout component – no data fetching:

```tsx
// src/components/BudtenderBoard.tsx
import React from "react";
import styles from "./BudtenderBoard.module.css";

export type Budtender = {
  id: string;
  name: string;
  picks_note_override?: string | null;
};

export type BoardPick = {
  id: string;
  product_name: string;
  category_line: string;
  note: string;
  doodle_key?: string | null;
  rank: number;
};

type BudtenderBoardProps = {
  budtender: Budtender;
  picks: BoardPick[];
};

export function BudtenderBoard({ budtender, picks }: BudtenderBoardProps) {
  const intro =
    budtender.picks_note_override ??
    `Hey, I’m ${budtender.name}. These are the things I actually grab for myself – ask me why.`;

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{budtender.name}&apos;s Picks</h1>
          <span className={styles.appName}>Guidelight</span>
        </div>

        <div className={styles.introBubble}>{intro}</div>
      </header>

      <main className={styles.grid}>
        {picks.map((pick) => (
          <article key={pick.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{pick.product_name}</h2>
            {pick.category_line && (
              <p className={styles.cardCategory}>“{pick.category_line}”</p>
            )}
            {pick.note && <p className={styles.cardNote}>“{pick.note}”</p>}

            {pick.doodle_key && (
              <div className={styles.cardDoodle}>
                {/* Wire this up to your actual DoodleIcon component when ready */}
                <span className={styles.doodleFallback}>
                  {pick.doodle_key}
                </span>
              </div>
            )}
          </article>
        ))}
      </main>

      <footer className={styles.footer}>
        <span className={styles.signature}>Xylent Studios</span>
      </footer>
    </div>
  );
}
```

### 5.3 `BudtenderBoard.module.css`

```css
.board {
  background: #ffffff;
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 20px 32px;
  color: #111827;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.titleRow {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}

.title {
  font-size: 2rem;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.appName {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #0f766e;
}

.introBubble {
  display: inline-block;
  max-width: 320px;
  padding: 8px 12px;
  border: 1.5px solid #111827;
  border-radius: 16px;
  font-size: 0.85rem;
  line-height: 1.35;
  background: #f9fafb;
}

/* GRID */

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

/* Cards */

.card {
  position: relative;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 10px 18px;
  background: #ffffff;
}

.cardTitle {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 4px;
}

.cardCategory {
  font-size: 0.8rem;
  font-style: italic;
  color: #4b5563;
  margin: 0 0 4px;
}

.cardNote {
  font-size: 0.8rem;
  line-height: 1.35;
  margin: 0;
}

/* doodle placeholder; swap for real SVG positioning */

.cardDoodle {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: 0.7rem;
  opacity: 0.7;
}

.doodleFallback {
  padding: 2px 4px;
  border-radius: 999px;
  border: 1px dashed #e5e7eb;
  color: #6b7280;
}

/* Footer signature */

.footer {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.signature {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
}

/* Responsive tweaks */

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .board {
    padding: 16px 12px 24px;
  }

  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .title {
    font-size: 1.6rem;
  }

  .introBubble {
    max-width: 100%;
  }
}
```

---

## 6. Staff View Integration (Future)

In Staff View, when editing picks, we can expand the form to include:

- `category_line` – free text, or derived from type.
- `why_i_love_it` – required one-liner.
- `doodle_key` – chosen from a `DoodlePicker` component.

`DoodlePicker` will:

- Render a row of doodle buttons using `DoodleIcon`.
- Toggle selection for the `doodle_key` field.
- Save that value into the `picks` row.

This allows any budtender to build their own **Picks Board** without needing code changes.

---

## 7. Testing

- Validate board rendering with:
  - Justin’s seed data.
  - A second budtender with fewer than 9 picks.
- Test on:
  - POS resolution (primary).
  - Laptop (development).
  - Mobile (for debugging and possible marketing capture).
- Verify:
  - Graceful behavior when budtender slug is invalid.
  - Graceful behavior when a budtender has no picks.
  - Performance: no noticeable lag when loading.

---

## 8. Ownership

- Product / UX: Xylent Studios
- Implementation: Guidelight dev (Xylent internal)
- Initial deployment: Justin’s Picks at State of Mind.
- Future: Any budtender can have a board using this same template.
