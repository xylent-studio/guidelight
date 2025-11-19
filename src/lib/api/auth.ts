import { supabase } from '../supabaseClient';
import type { Database } from '@/types';

export type Budtender = Database['public']['Tables']['budtenders']['Row'];

/**
 * Fetches the budtender profile for the currently logged-in user.
 * Matches auth.users.id to budtenders.auth_user_id.
 * 
 * @throws Error if user is not logged in or profile not found
 */
export async function getCurrentUserProfile(): Promise<Budtender> {
  // Get current session
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  
  if (sessionError) {
    throw new Error(`Failed to get session: ${sessionError.message}`);
  }
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  // Fetch budtender profile matching auth_user_id
  const { data: profile, error: profileError } = await supabase
    .from('budtenders')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  if (!profile) {
    throw new Error('User profile not found. Please contact an administrator.');
  }

  return profile;
}

