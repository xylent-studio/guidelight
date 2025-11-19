import { supabase } from '../supabaseClient';
import type { Database } from '../../types/database';

type Category = Database['public']['Tables']['categories']['Row'];

/**
 * Fetch all categories, ordered by sort_order
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
}

