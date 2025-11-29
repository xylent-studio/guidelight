# Session 15: Products Table + API-Ready Schema (Treez-Compatible)

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 5 - Product Catalog |
| **Estimated Duration** | 3-4 hours |
| **Prerequisites** | Session 14 completed, media_assets table exists (Session 08a) |
| **Output** | products table with API-ready schema, product_id FK on picks, API helpers |

---

## Pre-Session Checklist

- [ ] Session 14 completed successfully
- [ ] `media_assets` table exists (from Session 08a)
- [ ] `picks.image_asset_id` column exists (from Session 08)
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/11_PRODUCT_CATALOG_AND_ADD_PICK_FLOW.md`
- [ ] Read `docs/API_INTEGRATION_DESIGN.md` for Treez field mapping

---

## Session Goals

1. Create `products` table with API-integration-ready schema
2. Add `product_id` FK to picks
3. Create products API helpers with search
4. Import sample products from CSV (if available)

---

## Design Philosophy: API-Ready from Day One

This products table is designed to support future API integrations (Treez, Leafly, etc.) without schema changes. Key features:

- **Source tracking**: `source` field indicates where data came from
- **External ID storage**: `source_id` stores external system's product ID
- **Raw data preservation**: `source_data` JSONB stores full API response
- **Sync tracking**: `last_synced_at` tracks data freshness
- **Image flexibility**: Supports both URL (from API) and uploaded asset

---

## Schema: Products Table

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core product data
  name TEXT NOT NULL,
  brand TEXT,
  category product_category NOT NULL,  -- Use existing category enum
  product_type TEXT,  -- Flower, Pre-roll, Edible, Vape, Concentrate, Tincture, etc.
  description TEXT,
  
  -- Identifiers (for API matching/deduplication)
  sku TEXT,
  barcode TEXT,
  
  -- Potency/Lab data
  thc_percent NUMERIC(5,2),  -- e.g., 24.50
  cbd_percent NUMERIC(5,2),  -- e.g., 0.50
  terpenes JSONB,  -- Flexible: {"myrcene": 0.8, "limonene": 0.5, ...}
  
  -- Strain info
  strain_name TEXT,
  strain_type TEXT,  -- Sativa, Indica, Hybrid, CBD
  
  -- Pricing (multiple tiers for dispensary pricing)
  price_retail NUMERIC(10,2),   -- Regular price
  price_member NUMERIC(10,2),   -- Member/loyalty price
  price_sale NUMERIC(10,2),     -- Sale/promo price
  
  -- Inventory
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,  -- Actual count if available
  
  -- Images (dual support: API URL or uploaded asset)
  image_url TEXT,  -- From external API (Treez product image)
  image_asset_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,  -- Custom override
  
  -- ============================================
  -- API INTEGRATION FIELDS (CRITICAL FOR FUTURE)
  -- ============================================
  
  -- Source system identifier
  source TEXT NOT NULL DEFAULT 'manual',  -- 'manual', 'treez', 'leafly', 'dutchie', etc.
  
  -- External ID from source system
  source_id TEXT,  -- Treez product ID, Leafly strain ID, etc.
  
  -- Raw API response preserved (for debugging, field expansion)
  source_data JSONB,  -- Full API response stored for reference
  
  -- Sync tracking
  last_synced_at TIMESTAMPTZ,  -- When data was last refreshed from API
  
  -- Standard fields
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Primary search indexes
CREATE INDEX products_name_idx ON public.products(name);
CREATE INDEX products_brand_idx ON public.products(brand);
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_product_type_idx ON public.products(product_type);

-- API integration indexes (CRITICAL)
CREATE UNIQUE INDEX products_source_idx ON public.products(source, source_id) 
  WHERE source_id IS NOT NULL;  -- Unique per source system

-- Inventory/availability
CREATE INDEX products_in_stock_idx ON public.products(in_stock) WHERE is_active = true;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products (including anon for Display Mode)
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);

-- Only managers can create products
CREATE POLICY "products_insert_manager" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

-- Only managers can update products
CREATE POLICY "products_update_manager" ON public.products
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

-- Only managers can delete products
CREATE POLICY "products_delete_manager" ON public.products
  FOR DELETE TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.products IS 'Product catalog with API-ready schema for future Treez/Leafly integration.';
COMMENT ON COLUMN public.products.source IS 'Data source: manual, treez, leafly, dutchie, etc.';
COMMENT ON COLUMN public.products.source_id IS 'External product ID from source system for sync/matching.';
COMMENT ON COLUMN public.products.source_data IS 'Raw API response preserved for debugging and future field extraction.';
COMMENT ON COLUMN public.products.last_synced_at IS 'Timestamp of last successful sync from external API.';
COMMENT ON COLUMN public.products.image_url IS 'Product image URL from external API (Treez, etc).';
COMMENT ON COLUMN public.products.image_asset_id IS 'Custom uploaded image that overrides image_url if set.';
```

---

## Treez Field Mapping Reference

When Treez integration is built (Session 22), fields will map as follows:

| Treez Field | Products Column | Notes |
|-------------|-----------------|-------|
| `product_id` | `source_id` | Unique Treez identifier |
| `name` | `name` | Product name |
| `brand_name` | `brand` | Brand |
| `category` | `category` | Map to our enum |
| `product_type` | `product_type` | Flower, Edible, etc. |
| `sku` | `sku` | Stock keeping unit |
| `barcode` | `barcode` | UPC/barcode |
| `thc_percentage` | `thc_percent` | THC % |
| `cbd_percentage` | `cbd_percent` | CBD % |
| `retail_price` | `price_retail` | Regular price |
| `member_price` | `price_member` | Member price |
| `quantity_on_hand` | `stock_quantity` | Inventory count |
| `in_stock` | `in_stock` | Availability flag |
| `image_url` | `image_url` | Product image |
| `strain` | `strain_name` | Strain name |
| `strain_type` | `strain_type` | Indica/Sativa/Hybrid |
| *(full response)* | `source_data` | Preserved for reference |

---

## Migration: Add product_id to picks

```sql
-- Migration: add_product_id_to_picks

ALTER TABLE public.picks
  ADD COLUMN product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

CREATE INDEX picks_product_id_idx ON public.picks(product_id);

COMMENT ON COLUMN public.picks.product_id IS 'Optional link to product catalog. NULL = freeform pick.';
```

---

## API Helpers

Create `src/lib/api/products.ts`:

```typescript
import { supabase } from '../supabaseClient';
import type { Database } from '@/types/database';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];

/**
 * Get all active products
 */
export async function getProducts(limit = 100): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Search products by name, brand, or strain
 */
export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,strain_name.ilike.%${query}%`)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get products in stock only
 */
export async function getInStockProducts(limit = 50): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('in_stock', true)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching in-stock products:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
}

/**
 * Get a product by source system ID (for API sync)
 */
export async function getProductBySourceId(source: string, sourceId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('source', source)
    .eq('source_id', sourceId)
    .single();
  
  if (error && error.code !== 'PGRST116') {  // Ignore "no rows" error
    console.error('Error fetching product by source ID:', error);
  }
  
  return data || null;
}

/**
 * Upsert a product (for API sync - insert or update by source/source_id)
 */
export async function upsertProduct(product: ProductInsert): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .upsert(product, {
      onConflict: 'source,source_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting product:', error);
    return null;
  }
  
  return data;
}

/**
 * Get product image URL (handles asset vs URL priority)
 */
export function getProductImageUrl(product: Product): string | null {
  // Custom uploaded asset takes priority
  if (product.image_asset_id) {
    // Note: In real implementation, you'd need to look up the asset URL
    // This is handled by joining media_assets in queries that need it
    return null;  // Placeholder - actual implementation joins media_assets
  }
  
  // Fall back to API-provided URL
  return product.image_url;
}
```

---

## Acceptance Criteria

- [ ] `products` table created with all API-ready fields
- [ ] `source`, `source_id`, `source_data`, `last_synced_at` columns present
- [ ] Unique index on `(source, source_id)` for API sync
- [ ] `picks.product_id` FK added (nullable)
- [ ] RLS allows everyone to read, only managers to write
- [ ] Products API helpers work including `getProductBySourceId`
- [ ] No errors in `npm run build`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration: `create_products_table` | Create via MCP |
| Migration: `add_product_id_to_picks` | Create via MCP |
| `src/lib/api/products.ts` | Create |
| `src/types/database.ts` | Regenerate |

---

## Canonical Docs to Update

- [ ] `docs/GUIDELIGHT_SPEC.md` - Add products table to Section 4
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/11_PRODUCT_CATALOG_AND_ADD_PICK_FLOW.md` - Mark products table as "Implemented"
- [ ] `docs/API_INTEGRATION_DESIGN.md` - Update with actual schema

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Verify products table structure with `\d products`
- [ ] Test products API helpers
- [ ] Verify unique index prevents duplicate source_id per source
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. `ALTER TABLE public.picks DROP COLUMN product_id;`
2. `DROP TABLE public.products;`

---

## Next Session

→ **Session 16: Product Selection in Pick Flow**

