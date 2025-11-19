import { supabase } from '../supabaseClient';
import type { Database } from '../../types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type PickInsert = Database['public']['Tables']['picks']['Insert'];
type PickUpdate = Database['public']['Tables']['picks']['Update'];

/**
 * Fetch all picks for a given budtender
 */
export async function getPicksForBudtender(budtenderId: string): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('budtender_id', budtenderId)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching picks for budtender:', error);
    throw new Error(`Failed to fetch picks: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch picks for a budtender filtered by category
 */
export async function getPicksForBudtenderAndCategory(
  budtenderId: string,
  categoryId: string
): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('budtender_id', budtenderId)
    .eq('category_id', categoryId)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching picks for category:', error);
    throw new Error(`Failed to fetch picks: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch only active picks for a budtender (for Customer View)
 */
export async function getActivePicksForBudtender(budtenderId: string): Promise<Pick[]> {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('budtender_id', budtenderId)
    .eq('is_active', true)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Error fetching active picks:', error);
    throw new Error(`Failed to fetch active picks: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new pick
 * RLS: Staff can create picks for their own budtender_id, managers can create for anyone
 */
export async function createPick(pick: PickInsert): Promise<Pick> {
  const { data, error } = await supabase
    .from('picks')
    .insert(pick)
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
 * RLS: Staff can update their own picks, managers can update any pick
 */
export async function updatePick(id: string, updates: PickUpdate): Promise<Pick> {
  const { data, error } = await supabase
    .from('picks')
    .update(updates)
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
 */
export async function deactivatePick(id: string): Promise<Pick> {
  return updatePick(id, { is_active: false });
}

