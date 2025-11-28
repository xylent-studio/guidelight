import { supabase, fetchWithTimeout } from '../supabaseClient';
import type { Database } from '../../types/database';

type Category = Database['public']['Tables']['categories']['Row'];

// Timeout for API calls (Issue 10 fix)
const API_TIMEOUT_MS = 15000;

/**
 * Fetch all categories, ordered by sort_order
 */
export async function getCategories(): Promise<Category[]> {
  // Wrap with timeout to prevent hanging requests (Issue 10 fix)
  const { data, error } = await fetchWithTimeout(
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    API_TIMEOUT_MS
  );

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
}

