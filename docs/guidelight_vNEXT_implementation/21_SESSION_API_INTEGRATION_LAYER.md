# Session 21: API Integration Layer Design

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 8 - API Integration |
| **Estimated Duration** | 3-4 hours |
| **Prerequisites** | Sessions 1-20 completed, products table with API-ready schema |
| **Output** | integrations table, sync_logs table, integration architecture, Edge Function scaffold |

---

## Pre-Session Checklist

- [ ] All previous sessions completed
- [ ] `products` table has `source`, `source_id`, `source_data`, `last_synced_at` columns
- [ ] Read `docs/API_INTEGRATION_DESIGN.md`
- [ ] Treez API documentation available (or mock data structure)

---

## Session Goals

1. Create `integrations` table for API credentials/configuration
2. Create `sync_logs` table for tracking sync operations
3. Design and document sync service architecture
4. Create Edge Function scaffold for sync operations
5. Document Treez API endpoints needed

---

## Context: Why This Architecture?

**Goals:**
- Support multiple integrations (Treez now, Leafly/Dutchie later)
- Track sync history for debugging
- Handle partial failures gracefully
- Support both manual and scheduled sync
- Keep credentials secure in database (not code)

**Non-Goals for this session:**
- Actually connecting to Treez API (Session 22)
- Building sync UI
- Scheduled sync automation

---

## Schema: Integrations Table

```sql
-- Migration: create_integrations_table

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Integration identification
  type TEXT NOT NULL,  -- 'treez', 'leafly', 'dutchie', etc.
  name TEXT NOT NULL,  -- Human-friendly name: "Treez - Main Store"
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- API Configuration (encrypted in practice)
  config JSONB NOT NULL DEFAULT '{}',
  -- For Treez: { "api_key": "xxx", "dispensary_id": "yyy", "base_url": "https://api.treez.io/..." }
  
  -- Sync settings
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_interval_minutes INTEGER DEFAULT 60,  -- For scheduled sync
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,  -- 'success', 'partial', 'failed'
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.budtenders(id)
);

-- Only one active integration per type (for MVP)
CREATE UNIQUE INDEX integrations_type_active_idx ON public.integrations(type) 
  WHERE is_active = true;

-- RLS: Only managers can view/manage integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select_manager" ON public.integrations
  FOR SELECT TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

CREATE POLICY "integrations_insert_manager" ON public.integrations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

CREATE POLICY "integrations_update_manager" ON public.integrations
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

CREATE POLICY "integrations_delete_manager" ON public.integrations
  FOR DELETE TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

COMMENT ON TABLE public.integrations IS 'API integration configurations for external systems like Treez.';
COMMENT ON COLUMN public.integrations.config IS 'API credentials and settings. Should be treated as sensitive.';
```

---

## Schema: Sync Logs Table

```sql
-- Migration: create_sync_logs_table

CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What integration
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type TEXT NOT NULL,  -- 'manual', 'scheduled', 'webhook'
  status TEXT NOT NULL,  -- 'running', 'success', 'partial', 'failed'
  
  -- Results
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Stats
  products_fetched INTEGER DEFAULT 0,
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_unchanged INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  
  -- Details
  error_message TEXT,
  error_details JSONB,  -- Stack traces, API responses, etc.
  summary JSONB,  -- { "new_products": ["id1", "id2"], "updated": [...], ... }
  
  -- Who triggered
  triggered_by UUID REFERENCES public.budtenders(id)
);

-- Index for queries
CREATE INDEX sync_logs_integration_idx ON public.sync_logs(integration_id);
CREATE INDEX sync_logs_started_at_idx ON public.sync_logs(started_at DESC);

-- RLS: Same as integrations (managers only)
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_logs_select_manager" ON public.sync_logs
  FOR SELECT TO authenticated
  USING ((SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager');

-- Insert allowed for service role (Edge Functions)
CREATE POLICY "sync_logs_insert_service" ON public.sync_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "sync_logs_update_service" ON public.sync_logs
  FOR UPDATE TO service_role
  USING (true);

COMMENT ON TABLE public.sync_logs IS 'History of sync operations for debugging and monitoring.';
```

---

## Sync Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Guidelight App                          │
├─────────────────────────────────────────────────────────────┤
│  Manager UI                                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ Integration   │  │ Manual Sync   │  │ Sync History  │   │
│  │ Settings      │  │ Button        │  │ View          │   │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
│          │                  │                  │            │
└──────────┼──────────────────┼──────────────────┼────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                sync-products Function                  │  │
│  │                                                        │  │
│  │  1. Load integration config from DB                   │  │
│  │  2. Create sync_log entry (status: running)           │  │
│  │  3. Fetch products from external API                  │  │
│  │  4. For each product:                                 │  │
│  │     - Match by source_id                              │  │
│  │     - Upsert into products table                      │  │
│  │     - Track stats                                     │  │
│  │  5. Update sync_log (status: success/failed)          │  │
│  │  6. Update integration.last_sync_at                   │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             sync-images Function (optional)            │  │
│  │                                                        │  │
│  │  1. Find products with image_url but no image_asset   │  │
│  │  2. Download images from URL                          │  │
│  │  3. Upload to Supabase Storage                        │  │
│  │  4. Create media_asset records                        │  │
│  │  5. Update product.image_asset_id                     │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Treez     │  │   Leafly    │  │   Dutchie   │         │
│  │   API       │  │   API       │  │   API       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Function Scaffold

Create `supabase/functions/sync-products/index.ts`:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from '@supabase/supabase-js';

interface SyncRequest {
  integration_id: string;
  triggered_by?: string;
}

interface SyncResult {
  success: boolean;
  sync_log_id: string;
  stats: {
    fetched: number;
    created: number;
    updated: number;
    unchanged: number;
    errors: number;
  };
  error?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Parse request
    const { integration_id, triggered_by } = await req.json() as SyncRequest;
    
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Load integration config
    const { data: integration, error: intError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();
    
    if (intError || !integration) {
      throw new Error(`Integration not found: ${integration_id}`);
    }
    
    if (!integration.is_active) {
      throw new Error('Integration is not active');
    }
    
    // Create sync log
    const { data: syncLog, error: logError } = await supabase
      .from('sync_logs')
      .insert({
        integration_id,
        sync_type: triggered_by ? 'manual' : 'scheduled',
        status: 'running',
        triggered_by,
      })
      .select()
      .single();
    
    if (logError) {
      throw new Error(`Failed to create sync log: ${logError.message}`);
    }
    
    const stats = {
      fetched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      errors: 0,
    };
    
    try {
      // Dispatch to correct sync handler based on type
      switch (integration.type) {
        case 'treez':
          await syncTreezProducts(supabase, integration, stats);
          break;
        // Add more integrations here
        default:
          throw new Error(`Unknown integration type: ${integration.type}`);
      }
      
      // Update sync log - success
      const duration = Date.now() - new Date(syncLog.started_at).getTime();
      await supabase
        .from('sync_logs')
        .update({
          status: stats.errors > 0 ? 'partial' : 'success',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          products_fetched: stats.fetched,
          products_created: stats.created,
          products_updated: stats.updated,
          products_unchanged: stats.unchanged,
          errors_count: stats.errors,
        })
        .eq('id', syncLog.id);
      
      // Update integration last sync
      await supabase
        .from('integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: stats.errors > 0 ? 'partial' : 'success',
        })
        .eq('id', integration_id);
      
      return new Response(JSON.stringify({
        success: true,
        sync_log_id: syncLog.id,
        stats,
      } as SyncResult), {
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (syncError) {
      // Update sync log - failed
      await supabase
        .from('sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: syncError.message,
        })
        .eq('id', syncLog.id);
      
      await supabase
        .from('integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'failed',
        })
        .eq('id', integration_id);
      
      throw syncError;
    }
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Treez sync implementation - STUB for Session 22
async function syncTreezProducts(
  supabase: any, 
  integration: any, 
  stats: any
): Promise<void> {
  // TODO: Implement in Session 22
  throw new Error('Treez sync not implemented yet - see Session 22');
}
```

---

## API Helpers

Create `src/lib/api/integrations.ts`:

```typescript
import { supabase } from '../supabaseClient';
import type { Database } from '@/types/database';

export type Integration = Database['public']['Tables']['integrations']['Row'];
export type SyncLog = Database['public']['Tables']['sync_logs']['Row'];

/**
 * Get all integrations (managers only)
 */
export async function getIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching integrations:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get integration by type
 */
export async function getActiveIntegration(type: string): Promise<Integration | null> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .single();
  
  if (error) {
    return null;
  }
  
  return data;
}

/**
 * Get recent sync logs for an integration
 */
export async function getSyncLogs(integrationId: string, limit = 20): Promise<SyncLog[]> {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('integration_id', integrationId)
    .order('started_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching sync logs:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Trigger manual sync via Edge Function
 */
export async function triggerSync(integrationId: string, userId: string): Promise<{
  success: boolean;
  sync_log_id?: string;
  error?: string;
}> {
  const { data, error } = await supabase.functions.invoke('sync-products', {
    body: {
      integration_id: integrationId,
      triggered_by: userId,
    },
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return data;
}
```

---

## Treez API Documentation Notes

**Endpoints needed (document for Session 22):**

1. **List Products**
   - `GET /v2/dispensary/{id}/products`
   - Returns: Array of products with inventory, pricing, images

2. **Get Product**
   - `GET /v2/dispensary/{id}/products/{product_id}`
   - Returns: Single product with full details

3. **Authentication**
   - API Key in header: `Authorization: Bearer {api_key}`
   - Dispensary ID in path

**Rate Limits:**
- TBD - check Treez docs

**Webhook Support:**
- TBD - could enable real-time sync

---

## Acceptance Criteria

- [ ] `integrations` table created with all fields
- [ ] `sync_logs` table created with all fields
- [ ] RLS policies restrict to managers only
- [ ] Edge Function scaffold deployed (returns "not implemented")
- [ ] `integrations.ts` API helpers created
- [ ] Architecture documented in `API_INTEGRATION_DESIGN.md`
- [ ] No errors in `npm run build`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration: `create_integrations_table` | Create via MCP |
| Migration: `create_sync_logs_table` | Create via MCP |
| `supabase/functions/sync-products/index.ts` | Create scaffold |
| `src/lib/api/integrations.ts` | Create |
| `docs/API_INTEGRATION_DESIGN.md` | Update |
| `src/types/database.ts` | Regenerate |

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Verify tables created correctly
- [ ] Test Edge Function responds (even with error)
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Drop `sync_logs` table
2. Drop `integrations` table
3. Remove Edge Function

---

## Next Session

→ **Session 22: Treez Connector Implementation**




