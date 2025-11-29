# API Integration Design: Treez & Catalog Systems

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | 📋 Design Document |
| **Last Updated** | 2025-11-29 |
| **Owner** | Xylent Studios |
| **Audience** | AI Agents, Engineering |
| **Purpose** | Design notes for Treez/catalog API integration |

---

## 1. Overview

This document outlines the design approach for integrating Guidelight with external product catalog systems, specifically **Treez** as the initial integration target.

### Goals
- Pull real store product info, pricing, availability from Treez
- Sync product images automatically
- Future-proof the schema for other integrations (Leafly, etc.)
- Preserve data integrity and track sync operations

---

## 2. Products Table Design

The `products` table is designed with API integration in mind from day one:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core product data
  name TEXT NOT NULL,
  brand TEXT,
  category product_category NOT NULL,
  description TEXT,
  
  -- Identifiers (for API matching)
  sku TEXT,
  barcode TEXT,
  
  -- Potency/Lab data
  thc_percent NUMERIC(5,2),
  cbd_percent NUMERIC(5,2),
  terpenes JSONB,  -- Flexible for full lab data
  
  -- Pricing (supports multiple price tiers)
  price_retail NUMERIC(10,2),
  price_member NUMERIC(10,2),
  price_sale NUMERIC(10,2),
  
  -- Inventory
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  
  -- Images
  image_url TEXT,  -- From API or external source
  image_asset_id UUID REFERENCES media_assets(id),  -- Custom override
  
  -- API Integration fields (CRITICAL)
  source TEXT NOT NULL DEFAULT 'manual',  -- 'manual', 'treez', 'leafly', etc.
  source_id TEXT,  -- External ID from source system
  source_data JSONB,  -- Raw API response preserved
  last_synced_at TIMESTAMPTZ,  -- Track freshness
  
  -- Standard fields
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for API lookups (find product by external ID)
CREATE UNIQUE INDEX idx_products_source ON products(source, source_id) 
  WHERE source_id IS NOT NULL;
```

### Key Design Decisions

1. **`source` field**: Identifies where the product came from ('manual', 'treez', 'leafly')
2. **`source_id` field**: External system's ID for matching during sync
3. **`source_data` JSONB**: Preserves full API response (no data loss)
4. **`last_synced_at`**: Tracks when data was last refreshed from API
5. **Unique index on (source, source_id)**: Prevents duplicate imports

---

## 3. Integration Infrastructure

### 3.1 Integrations Table

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,  -- 'treez', 'leafly', etc.
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  credentials JSONB,  -- Encrypted API keys, tokens
  config JSONB,  -- Provider-specific settings
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 Sync Logs Table

```sql
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id),
  sync_type TEXT NOT NULL,  -- 'products', 'inventory', 'full'
  status TEXT NOT NULL,  -- 'started', 'success', 'failed', 'partial'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  metadata JSONB
);
```

---

## 4. Treez Integration

### 4.1 API Endpoints (Expected)

| Endpoint | Purpose |
|----------|---------|
| `GET /products` | List all products |
| `GET /products/{id}` | Get single product details |
| `GET /inventory` | Get current inventory levels |
| `GET /brands` | List brands |
| `GET /categories` | List categories |

### 4.2 Field Mapping

| Treez Field | Products Column | Notes |
|-------------|-----------------|-------|
| `product_id` | `source_id` | Primary matching key |
| `name` | `name` | |
| `brand_name` | `brand` | |
| `category` | `category` | May need mapping |
| `sku` | `sku` | |
| `barcode` | `barcode` | |
| `thc_percentage` | `thc_percent` | Convert if needed |
| `cbd_percentage` | `cbd_percent` | Convert if needed |
| `retail_price` | `price_retail` | |
| `member_price` | `price_member` | |
| `quantity_on_hand` | `stock_quantity` | |
| `image_url` | `image_url` | |
| *(full response)* | `source_data` | Preserve everything |

### 4.3 Sync Strategy

1. **Initial Import**
   - Pull all products from Treez
   - Create new products with `source = 'treez'`
   - Store `source_id` for future matching

2. **Incremental Sync**
   - Query Treez for products modified since `last_synced_at`
   - Match existing products by `(source, source_id)`
   - Update changed fields, preserve manual overrides

3. **Conflict Resolution**
   - API fields overwrite UNLESS manually overridden
   - Track manual overrides (e.g., `image_asset_id` set = don't overwrite)
   - `source_data` always updated with latest API response

4. **Image Sync**
   - Download product images from Treez URLs
   - Store in Supabase Storage
   - Update `image_url` with local URL

---

## 5. Pick-Product Linking

### 5.1 Schema Addition to Picks

```sql
ALTER TABLE picks 
  ADD COLUMN product_id UUID REFERENCES products(id),
  ADD COLUMN image_asset_id UUID REFERENCES media_assets(id);
```

### 5.2 Image Inheritance Logic

When displaying a pick's image:

```typescript
function getPickImage(pick: Pick, product: Product | null): string | null {
  // 1. Pick has custom image - use it
  if (pick.image_asset_id) {
    return getAssetUrl(pick.image_asset_id);
  }
  
  // 2. No linked product - no image
  if (!product) {
    return null;
  }
  
  // 3. Product has custom override - use it
  if (product.image_asset_id) {
    return getAssetUrl(product.image_asset_id);
  }
  
  // 4. Product has API image - use it
  if (product.image_url) {
    return product.image_url;
  }
  
  // 5. No image available
  return null;
}
```

---

## 6. Implementation Phases

### Phase 8 Sessions

| Session | Focus |
|---------|-------|
| 21 | API Integration Layer Design - Tables, architecture |
| 22 | Treez Connector - Client, sync, conflict resolution |

### Future Sessions (Not Yet Scheduled)

- Inventory real-time sync
- Price tier management
- Multi-location support
- Leafly/Weedmaps integration
- API webhook handlers

---

## 7. Security Considerations

1. **API Credentials**
   - Store encrypted in `integrations.credentials`
   - Never expose in client-side code
   - Use Supabase Edge Functions for API calls

2. **Rate Limiting**
   - Respect Treez API limits
   - Queue bulk operations
   - Implement backoff on failures

3. **Data Validation**
   - Validate API responses before storing
   - Log malformed data for review
   - Don't fail entire sync on single product error

---

## 8. Related Documentation

- `docs/guidelight_vNEXT_implementation/21_SESSION_API_INTEGRATION_LAYER.md`
- `docs/guidelight_vNEXT_implementation/22_SESSION_TREEZ_CONNECTOR.md`
- `docs/guidelight_vNEXT_implementation/15_SESSION_PRODUCTS_TABLE.md`
- `docs/guidelight_vNEXT_implementation/16_SESSION_PRODUCT_SELECTION.md`
- `docs/CANVAS_AND_SIGNAGE_VISION.md`

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-29



