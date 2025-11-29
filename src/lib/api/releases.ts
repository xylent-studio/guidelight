import { supabase } from '../supabaseClient';
import type { Database } from '@/types/database';

export type Release = Database['public']['Tables']['releases']['Row'];

/**
 * Get the latest release
 */
export async function getLatestRelease(): Promise<Release | null> {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching latest release:', error);
    return null;
  }
  
  return data;
}

/**
 * Get all releases (for history)
 */
export async function getReleases(): Promise<Release[]> {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Check if there's an unseen release
 */
export async function hasUnseenRelease(lastSeenReleaseId: string | null): Promise<boolean> {
  const latest = await getLatestRelease();
  
  if (!latest) return false;
  if (!lastSeenReleaseId) return true;
  
  return latest.id !== lastSeenReleaseId;
}

