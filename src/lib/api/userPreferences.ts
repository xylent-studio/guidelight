import { supabase } from '../supabaseClient';

export type UserPreferences = {
  user_id: string;
  last_route: string | null;
  last_board_id: string | null;
  last_seen_release_id: string | null;
  updated_at: string;
};

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Update user preferences (upsert)
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>
): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Update last route
 */
export async function updateLastRoute(userId: string, route: string): Promise<void> {
  await updateUserPreferences(userId, { last_route: route });
}

/**
 * Update last board
 */
export async function updateLastBoard(userId: string, boardId: string): Promise<void> {
  await updateUserPreferences(userId, { last_board_id: boardId });
}

/**
 * Update last seen release
 */
export async function updateLastSeenRelease(userId: string, releaseId: string): Promise<void> {
  await updateUserPreferences(userId, { last_seen_release_id: releaseId });
}

