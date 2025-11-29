import { supabase } from '../supabaseClient';
import type { Database, Json } from '@/types/database';

// CRITICAL FIX (Issue 6): Renamed to avoid collision with src/types/pickDraft.ts
// - PickDraftRow = database row from pick_drafts table
// - PickDraft (in types/pickDraft.ts) = form state object
export type PickDraftRow = Database['public']['Tables']['pick_drafts']['Row'];

// Helper type for the JSON data field
export type DraftData = Record<string, unknown>;

/**
 * Get all drafts for the current user
 */
export async function getUserDrafts(): Promise<PickDraftRow[]> {
  const { data, error } = await supabase
    .from('pick_drafts')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a specific draft by ID
 */
export async function getDraftById(draftId: string): Promise<PickDraftRow | null> {
  const { data, error } = await supabase
    .from('pick_drafts')
    .select('*')
    .eq('id', draftId)
    .single();
  
  if (error) {
    console.error('Error fetching draft:', error);
    return null;
  }
  
  return data;
}

/**
 * Get draft for editing an existing pick
 */
export async function getDraftForPick(pickId: string): Promise<PickDraftRow | null> {
  const { data, error } = await supabase
    .from('pick_drafts')
    .select('*')
    .eq('pick_id', pickId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching draft for pick:', error);
    return null;
  }
  
  return data;
}

/**
 * Create or update a draft (upsert)
 */
export async function saveDraft(
  userId: string,
  data: DraftData,
  pickId?: string,
  draftId?: string
): Promise<PickDraftRow | null> {
  // Cast data to Json type for Supabase
  const jsonData = data as Json;
  
  if (draftId) {
    // Update existing draft
    const { data: updated, error } = await supabase
      .from('pick_drafts')
      .update({ 
        data: jsonData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', draftId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating draft:', error);
      return null;
    }
    
    return updated;
  }
  
  // Create new draft or upsert based on pick_id
  const { data: created, error } = await supabase
    .from('pick_drafts')
    .upsert(
      {
        user_id: userId,
        pick_id: pickId || null,
        data: jsonData,
      },
      {
        onConflict: 'user_id,pick_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Error saving draft:', error);
    return null;
  }
  
  return created;
}

/**
 * Delete a draft
 */
export async function deleteDraft(draftId: string): Promise<boolean> {
  const { error } = await supabase
    .from('pick_drafts')
    .delete()
    .eq('id', draftId);
  
  if (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete draft by pick_id (used after publishing)
 */
export async function deleteDraftForPick(pickId: string): Promise<boolean> {
  const { error } = await supabase
    .from('pick_drafts')
    .delete()
    .eq('pick_id', pickId);
  
  if (error) {
    console.error('Error deleting draft for pick:', error);
    return false;
  }
  
  return true;
}

