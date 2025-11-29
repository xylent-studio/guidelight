# Session 22: Treez Connector Implementation

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 8 - API Integration |
| **Estimated Duration** | 4-5 hours |
| **Prerequisites** | Session 21 completed, Treez API credentials |
| **Output** | Working Treez product sync, conflict resolution, basic sync UI |

---

## Pre-Session Checklist

- [ ] Session 21 completed successfully
- [ ] `integrations` and `sync_logs` tables exist
- [ ] Edge Function scaffold deployed
- [ ] Treez API credentials available (or test/sandbox account)
- [ ] Treez API documentation reviewed
- [ ] Read `docs/API_INTEGRATION_DESIGN.md`

---

## Session Goals

1. Implement Treez API client in Edge Function
2. Build product sync logic with upsert
3. Handle field mapping from Treez to our schema
4. Implement conflict resolution (API vs manual edits)
5. Create basic sync UI for managers
6. Test end-to-end sync flow

---

## Treez API Overview

**Base URL:** `https://api.treez.io/v2` (or sandbox URL)

**Authentication:**
```
Authorization: Bearer {api_key}
X-Dispensary-Id: {dispensary_id}
```

**Key Endpoints:**
- `GET /products` - List all products
- `GET /products/{id}` - Get single product
- `GET /inventory` - Get inventory levels

---

## Implementation Steps

### Step 1: Implement Treez API Client

Update `supabase/functions/sync-products/index.ts`:

```typescript
// Treez API types
interface TreezProduct {
  product_id: string;
  name: string;
  brand_name: string | null;
  category: string;
  product_type: string | null;
  sku: string | null;
  barcode: string | null;
  thc_percentage: number | null;
  cbd_percentage: number | null;
  strain: string | null;
  strain_type: string | null;
  retail_price: number | null;
  member_price: number | null;
  quantity_on_hand: number;
  image_url: string | null;
  description: string | null;
  // ... other Treez-specific fields
}

interface TreezConfig {
  api_key: string;
  dispensary_id: string;
  base_url: string;
}

// Fetch products from Treez API
async function fetchTreezProducts(config: TreezConfig): Promise<TreezProduct[]> {
  const response = await fetch(`${config.base_url}/products`, {
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'X-Dispensary-Id': config.dispensary_id,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Treez API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.products || data; // Adapt based on actual Treez response structure
}

// Map Treez product to our schema
function mapTreezProduct(treezProduct: TreezProduct): any {
  return {
    name: treezProduct.name,
    brand: treezProduct.brand_name,
    category: mapTreezCategory(treezProduct.category),
    product_type: treezProduct.product_type,
    description: treezProduct.description,
    sku: treezProduct.sku,
    barcode: treezProduct.barcode,
    thc_percent: treezProduct.thc_percentage,
    cbd_percent: treezProduct.cbd_percentage,
    strain_name: treezProduct.strain,
    strain_type: treezProduct.strain_type,
    price_retail: treezProduct.retail_price,
    price_member: treezProduct.member_price,
    stock_quantity: treezProduct.quantity_on_hand,
    in_stock: treezProduct.quantity_on_hand > 0,
    image_url: treezProduct.image_url,
    
    // API integration fields
    source: 'treez',
    source_id: treezProduct.product_id,
    source_data: treezProduct,  // Store full response
    last_synced_at: new Date().toISOString(),
  };
}

// Map Treez category to our category enum
function mapTreezCategory(treezCategory: string): string {
  const categoryMap: Record<string, string> = {
    'flower': 'flower',
    'pre-roll': 'pre_roll',
    'preroll': 'pre_roll',
    'edible': 'edible',
    'edibles': 'edible',
    'vape': 'vape',
    'vapes': 'vape',
    'concentrate': 'concentrate',
    'concentrates': 'concentrate',
    'tincture': 'tincture',
    'tinctures': 'tincture',
    'topical': 'topical',
    'topicals': 'topical',
    'accessory': 'other',
    'accessories': 'other',
    // Add more mappings as needed
  };
  
  const normalized = treezCategory.toLowerCase().trim();
  return categoryMap[normalized] || 'other';
}

// Main sync function
async function syncTreezProducts(
  supabase: any, 
  integration: any, 
  stats: any
): Promise<void> {
  const config = integration.config as TreezConfig;
  
  if (!config.api_key || !config.dispensary_id) {
    throw new Error('Missing Treez API configuration');
  }
  
  // Fetch products from Treez
  const treezProducts = await fetchTreezProducts(config);
  stats.fetched = treezProducts.length;
  
  // Process each product
  for (const treezProduct of treezProducts) {
    try {
      const mappedProduct = mapTreezProduct(treezProduct);
      
      // Check if product exists
      const { data: existing } = await supabase
        .from('products')
        .select('id, updated_at, source_data')
        .eq('source', 'treez')
        .eq('source_id', treezProduct.product_id)
        .single();
      
      if (existing) {
        // Check if anything changed (compare source_data)
        const existingData = existing.source_data;
        if (JSON.stringify(existingData) === JSON.stringify(treezProduct)) {
          stats.unchanged++;
          continue;
        }
        
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(mappedProduct)
          .eq('id', existing.id);
        
        if (error) {
          console.error(`Error updating product ${treezProduct.product_id}:`, error);
          stats.errors++;
        } else {
          stats.updated++;
        }
      } else {
        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert(mappedProduct);
        
        if (error) {
          console.error(`Error inserting product ${treezProduct.product_id}:`, error);
          stats.errors++;
        } else {
          stats.created++;
        }
      }
    } catch (productError) {
      console.error(`Error processing product ${treezProduct.product_id}:`, productError);
      stats.errors++;
    }
  }
}
```

### Step 2: Handle Conflict Resolution

Add conflict handling logic:

```typescript
// Conflict resolution strategy
type ConflictStrategy = 'api_wins' | 'manual_wins' | 'merge';

function resolveConflicts(
  existing: any, 
  incoming: any, 
  strategy: ConflictStrategy = 'api_wins'
): any {
  switch (strategy) {
    case 'api_wins':
      // API data overwrites everything except custom image
      return {
        ...incoming,
        image_asset_id: existing.image_asset_id,  // Preserve custom image
      };
      
    case 'manual_wins':
      // Only update API-sourced fields, preserve manual edits
      return {
        ...existing,
        // Only update inventory/pricing from API
        price_retail: incoming.price_retail,
        price_member: incoming.price_member,
        stock_quantity: incoming.stock_quantity,
        in_stock: incoming.in_stock,
        source_data: incoming.source_data,
        last_synced_at: incoming.last_synced_at,
      };
      
    case 'merge':
      // Smart merge: update if field was not manually changed
      // This requires tracking which fields were manually edited
      // Defer for future enhancement
      return {
        ...incoming,
        image_asset_id: existing.image_asset_id,
      };
      
    default:
      return incoming;
  }
}
```

### Step 3: Create Sync UI Component

Create `src/components/admin/IntegrationSync.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { RefreshCw, Check, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  getActiveIntegration, 
  getSyncLogs, 
  triggerSync,
  Integration,
  SyncLog,
} from '@/lib/api/integrations';
import { useAuth } from '@/hooks/useAuth';

type IntegrationSyncProps = {
  integrationType: string;
};

export function IntegrationSync({ integrationType }: IntegrationSyncProps) {
  const { profile } = useAuth();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [integrationType]);

  async function loadData() {
    setLoading(true);
    const int = await getActiveIntegration(integrationType);
    setIntegration(int);
    
    if (int) {
      const logs = await getSyncLogs(int.id);
      setSyncLogs(logs);
    }
    setLoading(false);
  }

  async function handleSync() {
    if (!integration || !profile) return;
    
    setSyncing(true);
    const result = await triggerSync(integration.id, profile.id);
    
    if (result.success) {
      // Reload logs
      const logs = await getSyncLogs(integration.id);
      setSyncLogs(logs);
      
      // Reload integration for updated last_sync_at
      const int = await getActiveIntegration(integrationType);
      setIntegration(int);
    } else {
      alert(`Sync failed: ${result.error}`);
    }
    
    setSyncing(false);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <Check size={14} className="text-green-500" />;
      case 'partial': return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'failed': return <AlertTriangle size={14} className="text-red-500" />;
      case 'running': return <RefreshCw size={14} className="animate-spin" />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }

  if (!integration) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          No {integrationType} integration configured.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Contact your administrator to set up the integration.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{integration.name}</h3>
          <p className="text-sm text-muted-foreground">
            {integration.last_sync_at 
              ? `Last synced: ${new Date(integration.last_sync_at).toLocaleString()}`
              : 'Never synced'
            }
          </p>
        </div>
        
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw size={16} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {/* Recent sync logs */}
      {syncLogs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Syncs</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {syncLogs.slice(0, 5).map(log => (
              <div 
                key={log.id}
                className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(log.status)}
                  <span>{new Date(log.started_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {log.status === 'success' || log.status === 'partial' ? (
                    <span className="text-muted-foreground">
                      +{log.products_created} / ↺{log.products_updated} / ={log.products_unchanged}
                    </span>
                  ) : log.error_message ? (
                    <span className="text-destructive text-xs truncate max-w-[200px]">
                      {log.error_message}
                    </span>
                  ) : null}
                  <Badge variant={log.status === 'success' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
```

### Step 4: Add to Manager Settings

Add sync UI to manager settings or create dedicated page:

```typescript
// In ManagerSettingsView.tsx or similar
import { IntegrationSync } from '@/components/admin/IntegrationSync';

// In render:
<div className="space-y-6">
  <h2 className="text-lg font-semibold">Product Integrations</h2>
  <IntegrationSync integrationType="treez" />
</div>
```

---

## Treez Configuration Setup

To set up a Treez integration, insert into `integrations` table:

```sql
INSERT INTO integrations (type, name, config, is_active)
VALUES (
  'treez',
  'Treez - State of Mind',
  '{
    "api_key": "your-treez-api-key",
    "dispensary_id": "your-dispensary-id",
    "base_url": "https://api.treez.io/v2"
  }',
  true
);
```

---

## Acceptance Criteria

- [ ] Treez API client fetches products successfully
- [ ] Products upserted correctly (create new, update existing)
- [ ] `source_data` stores full Treez response
- [ ] Category mapping works correctly
- [ ] Custom images preserved during sync
- [ ] Sync logs record stats accurately
- [ ] UI shows sync button and history
- [ ] Error handling covers API failures
- [ ] No errors in `npm run build`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/sync-products/index.ts` | Implement Treez sync |
| `src/components/admin/IntegrationSync.tsx` | Create |
| Manager settings or admin page | Add IntegrationSync |

---

## Testing Plan

1. **Unit Test Mapping:**
   - Test `mapTreezProduct` with various Treez responses
   - Test `mapTreezCategory` with edge cases

2. **Integration Test:**
   - Set up test Treez credentials
   - Run sync manually
   - Verify products created/updated correctly

3. **Error Cases:**
   - Invalid API credentials
   - Treez API down
   - Malformed product data
   - Rate limiting

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Document Treez setup process
- [ ] Test full sync flow
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Disable integration: `UPDATE integrations SET is_active = false WHERE type = 'treez'`
2. Clear synced products if needed: `DELETE FROM products WHERE source = 'treez'`
3. Revert Edge Function to stub

---

## Future Enhancements

1. **Scheduled Sync** - Use pg_cron or external scheduler
2. **Webhook Support** - Real-time updates from Treez
3. **Image Sync** - Download and store product images locally
4. **Inventory Alerts** - Notify when stock changes
5. **Price Change Tracking** - Log price history
6. **Multiple Locations** - Support multi-store setups

---

## Next Steps

After completing Treez integration:
- Monitor sync logs for issues
- Tune category mapping based on real data
- Consider adding scheduled sync
- Plan for additional integrations (Leafly, Dutchie, etc.)




