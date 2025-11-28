import { supabase, fetchWithTimeout } from '../supabaseClient';
import type { Database } from '../../types/database';

type Budtender = Database['public']['Tables']['budtenders']['Row'];

// Timeout for API calls (Issue 10 fix)
const API_TIMEOUT_MS = 15000;

/**
 * Fetch all budtenders
 */
export async function getBudtenders(): Promise<Budtender[]> {
  const { data, error } = await supabase
    .from('budtenders')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching budtenders:', error);
    throw new Error(`Failed to fetch budtenders: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch only active budtenders (is_active = true)
 */
export async function getActiveBudtenders(): Promise<Budtender[]> {
  // Wrap with timeout to prevent hanging requests (Issue 10 fix)
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('budtenders')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    API_TIMEOUT_MS
  );

  if (error) {
    console.error('Error fetching active budtenders:', error);
    throw new Error(`Failed to fetch active budtenders: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single budtender by ID
 */
export async function getBudtenderById(id: string): Promise<Budtender | null> {
  const { data, error } = await supabase
    .from('budtenders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching budtender:', error);
    throw new Error(`Failed to fetch budtender: ${error.message}`);
  }

  return data;
}

/**
 * Create a new budtender profile
 * RLS: Only managers can INSERT (requires manager INSERT policy)
 * 
 * Note: For MVP, this assumes auth_user_id already exists (from Supabase Dashboard invite).
 * Post-MVP: Move to Edge Function for one-click invite flow.
 */
export async function createBudtender(
  data: Database['public']['Tables']['budtenders']['Insert']
): Promise<Budtender> {
  const { data: newBudtender, error } = await supabase
    .from('budtenders')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating budtender:', error);
    
    // Provide helpful error messages
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('This user already has a budtender profile.');
    }
    if (error.code === '23503') {
      // Foreign key violation
      throw new Error('Invalid auth_user_id. Please check the User ID and try again.');
    }
    if (error.message.includes('permission denied') || error.message.includes('policy')) {
      throw new Error('You do not have permission to create staff profiles. Only managers can invite staff.');
    }
    
    throw new Error(`Failed to create budtender: ${error.message}`);
  }

  if (!newBudtender) {
    throw new Error('Failed to create budtender profile.');
  }

  return newBudtender;
}

/**
 * Update a budtender's profile
 * RLS: Staff can update their own row, managers can update any row
 */
export async function updateBudtender(
  id: string,
  updates: Database['public']['Tables']['budtenders']['Update']
): Promise<Budtender> {
  const { data, error } = await supabase
    .from('budtenders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating budtender:', error);
    
    if (error.message.includes('permission denied') || error.message.includes('policy')) {
      throw new Error('You do not have permission to update this profile.');
    }
    
    throw new Error(`Failed to update budtender: ${error.message}`);
  }

  if (!data) {
    throw new Error('Budtender not found or update failed');
  }

  return data;
}

/**
 * Get the count of picks for a budtender (useful for delete confirmation)
 */
export async function getBudtenderPickCount(budtenderId: string): Promise<number> {
  const { count, error } = await supabase
    .from('picks')
    .select('*', { count: 'exact', head: true })
    .eq('budtender_id', budtenderId);

  if (error) {
    console.error('Error counting picks:', error);
    return 0; // Return 0 on error rather than throwing
  }

  return count || 0;
}

/**
 * Delete a budtender profile (hard delete)
 * RLS: Only managers can DELETE (requires manager DELETE policy)
 * RLS also prevents self-deletion (defense in depth)
 * 
 * This will CASCADE delete all picks associated with this budtender.
 */
export async function deleteBudtender(id: string): Promise<void> {
  const { error } = await supabase
    .from('budtenders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budtender:', error);
    
    if (error.message.includes('permission denied') || error.message.includes('policy')) {
      // Could be: not a manager OR trying to delete self
      throw new Error('You do not have permission to delete this staff member. Note: You cannot delete yourself.');
    }
    
    throw new Error(`Failed to delete budtender: ${error.message}`);
  }
}

