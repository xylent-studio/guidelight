import { supabase, fetchWithTimeout } from '../supabaseClient';
import type { Database } from '../../types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type PickInsert = Database['public']['Tables']['picks']['Insert'];
type PickUpdate = Database['public']['Tables']['picks']['Update'];

// Timeout for API calls (Issue 10 fix)
const API_TIMEOUT_MS = 15000;

/**
 * Sort picks according to the rating-based ordering system:
 * - Active picks first (is_active = true), then inactive
 * - Among active: sort by rating desc (null = lowest), then updated_at desc
 * - Among inactive: sort by last_active_at desc (null last), then updated_at desc
 */
function sortPicks(picks: Pick[]): Pick[] {
  return [...picks].sort((a, b) => {
    // Active picks first
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }

    if (a.is_active) {
      // Among active: rating desc (null = 0), then updated_at desc
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else {
      // Among inactive: last_active_at desc (null last), then updated_at desc
      const lastA = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
      const lastB = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
      if (lastA !== lastB) return lastB - lastA;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });
}

/**
 * Sort active picks only (for Customer View):
 * - By rating desc (null = lowest), then updated_at desc
 */
function sortActivePicks(picks: Pick[]): Pick[] {
  return [...picks].sort((a, b) => {
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    if (ratingA !== ratingB) return ratingB - ratingA;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

/**
 * Fetch all picks for a given budtender (Staff View)
 * Returns picks sorted by: active first, then rating, then recency
 */
export async function getPicksForBudtender(budtenderId: string): Promise<Pick[]> {
  // Wrap with timeout to prevent hanging requests (Issue 10 fix)
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('picks')
      .select('*')
      .eq('budtender_id', budtenderId),
    API_TIMEOUT_MS
  );

  if (error) {
    console.error('Error fetching picks for budtender:', error);
    throw new Error(`Failed to fetch picks: ${error.message}`);
  }

  return sortPicks(data || []);
}

/**
 * Fetch picks for a budtender filtered by category
 * Returns picks sorted by: active first, then rating, then recency
 */
export async function getPicksForBudtenderAndCategory(
  budtenderId: string,
  categoryId: string
): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('budtender_id', budtenderId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error fetching picks for category:', error);
    throw new Error(`Failed to fetch picks: ${error.message}`);
  }

  return sortPicks(data || []);
}

/**
 * Fetch only PUBLISHED picks for a budtender (for Customer View)
 * Returns picks sorted by rating (high to low), then updated_at
 * 
 * IMPORTANT: This is the customer-facing query.
 * Rule: status = 'published' AND is_active = true
 */
export async function getActivePicksForBudtender(budtenderId: string): Promise<Pick[]> {
  // Wrap with timeout to prevent hanging requests (Issue 10 fix)
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('picks')
      .select('*')
      .eq('budtender_id', budtenderId)
      .eq('is_active', true)
      .eq('status', 'published'),  // Issue 3 fix: Filter by status for customer views
    API_TIMEOUT_MS
  );

  if (error) {
    console.error('Error fetching active picks:', error);
    throw new Error(`Failed to fetch active picks: ${error.message}`);
  }

  return sortActivePicks(data || []);
}

/**
 * Get ALL published picks (for house list / auto_store board)
 * Used by Display Mode and auto boards
 */
export async function getPublishedPicks(limit = 24): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*, budtenders(name)')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching published picks:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get published picks for a specific budtender (for auto_user board)
 */
export async function getPublishedPicksForBudtender(budtenderId: string): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('budtender_id', budtenderId)
    .eq('status', 'published')
    .eq('is_active', true)
    .order('rating', { ascending: false });
  
  if (error) {
    console.error('Error fetching budtender picks:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Create a new pick
 * - Sets default rating to 4 if not provided
 * - Sets last_active_at to now() if creating as active (default)
 * RLS: Staff can create picks for their own budtender_id, managers can create for anyone
 */
export async function createPick(pick: PickInsert): Promise<Pick> {
  // Apply defaults for new picks
  const pickWithDefaults: PickInsert = {
    ...pick,
    // Default rating to 4 stars for new picks
    rating: pick.rating !== undefined ? pick.rating : 4,
    // Set last_active_at if creating as active (default is active)
    last_active_at: pick.is_active !== false ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('picks')
    .insert(pickWithDefaults)
    .select()
    .single();

  if (error) {
    console.error('Error creating pick:', error);
    // Check for unique constraint violation on special_role
    if (error.code === '23505' && error.message.includes('picks_active_special_role_unique')) {
      throw new Error(
        `You already have an active pick with this special role. Deactivate the existing one first.`
      );
    }
    throw new Error(`Failed to create pick: ${error.message}`);
  }

  if (!data) {
    throw new Error('Pick creation failed');
  }

  return data;
}

/**
 * Update an existing pick
 * Handles last_active_at logic:
 * - If toggling is_active false→true: sets last_active_at to now()
 * - If toggling is_active true→false: preserves existing last_active_at
 * - If editing an active pick: refreshes last_active_at to now()
 * RLS: Staff can update their own picks, managers can update any pick
 */
export async function updatePick(
  id: string,
  updates: PickUpdate,
  currentPick?: Pick
): Promise<Pick> {
  // Build the final updates with last_active_at logic
  const finalUpdates: PickUpdate = { ...updates };

  // If we have the current pick, we can apply last_active_at logic
  if (currentPick) {
    const wasActive = currentPick.is_active;
    const willBeActive = updates.is_active !== undefined ? updates.is_active : wasActive;

    if (!wasActive && willBeActive) {
      // Toggling false → true: set last_active_at to now
      finalUpdates.last_active_at = new Date().toISOString();
    } else if (wasActive && willBeActive) {
      // Editing an active pick: refresh last_active_at
      finalUpdates.last_active_at = new Date().toISOString();
    }
    // If toggling true → false: preserve existing last_active_at (don't include in updates)
  } else if (updates.is_active === true) {
    // If we don't have the current pick but we're setting is_active to true,
    // always update last_active_at (covers toggle and edit cases)
    finalUpdates.last_active_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('picks')
    .update(finalUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pick:', error);
    // Check for unique constraint violation on special_role
    if (error.code === '23505' && error.message.includes('picks_active_special_role_unique')) {
      throw new Error(
        `You already have an active pick with this special role. Deactivate the existing one first.`
      );
    }
    throw new Error(`Failed to update pick: ${error.message}`);
  }

  if (!data) {
    throw new Error('Pick not found or update failed');
  }

  return data;
}

/**
 * Toggle a pick's active status
 * Properly handles last_active_at:
 * - false→true: sets last_active_at to now
 * - true→false: preserves existing last_active_at
 */
export async function togglePickActive(pick: Pick): Promise<Pick> {
  const newActive = !pick.is_active;
  const updates: PickUpdate = { is_active: newActive };

  // Only update last_active_at when activating
  if (newActive) {
    updates.last_active_at = new Date().toISOString();
  }
  // When deactivating, we don't touch last_active_at (preserves when it was last active)

  return updatePick(pick.id, updates);
}

/**
 * Delete a pick (hard delete)
 * RLS: Staff can delete their own picks, managers can delete any pick
 */
export async function deletePick(id: string): Promise<void> {
  const { error } = await supabase.from('picks').delete().eq('id', id);

  if (error) {
    console.error('Error deleting pick:', error);
    throw new Error(`Failed to delete pick: ${error.message}`);
  }
}

/**
 * Soft delete a pick by setting is_active = false
 * Preferred over hard delete to preserve history
 * Note: Preserves last_active_at to remember when the pick was last in use
 */
export async function deactivatePick(id: string): Promise<Pick> {
  // Don't pass currentPick so we don't accidentally update last_active_at
  return updatePick(id, { is_active: false });
}

// =============================================================
// Session 05: Board canvas pick loading helpers
// =============================================================

/**
 * Get picks by IDs, filtered to only visible (published + active) picks.
 * Used for loading pick data for board items in display mode.
 * 
 * IMPORTANT: This filters out archived/inactive picks. The board canvas
 * must handle the case where some pick_ids don't return data (stale items).
 */
export async function getVisiblePicksByIds(pickIds: string[]): Promise<Pick[]> {
  if (pickIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .in('id', pickIds)
    .eq('status', 'published')  // Only published picks
    .eq('is_active', true);      // Only active picks
  
  if (error) {
    console.error('Error fetching picks by IDs:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get ALL picks by IDs (including archived) - for staff edit mode.
 * Still filters soft-deleted picks (is_active = false).
 * Returns empty array if pick was hard-deleted.
 * 
 * Session 08: Joins budtenders to get name for attribution display.
 */
export async function getAllPicksByIds(pickIds: string[]): Promise<Pick[]> {
  if (pickIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('picks')
    .select('*, budtenders(name)')  // Join budtenders for attribution
    .in('id', pickIds)
    .eq('is_active', true);  // Still filter soft-deleted
  
  if (error) {
    console.error('Error fetching picks by IDs:', error);
    return [];
  }
  
  return data || [];
}
