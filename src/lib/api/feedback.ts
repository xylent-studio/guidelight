import { supabase } from '../supabaseClient';
import type { Database } from '../../types/database';

type Feedback = Database['public']['Tables']['feedback']['Row'];
type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];

export type FeedbackType = 'bug' | 'suggestion' | 'feature' | 'general' | 'other';
export type FeedbackUrgency = 'noting' | 'nice_to_have' | 'annoying' | 'blocking';
export type FeedbackStatus = 'new' | 'reviewed' | 'in_progress' | 'done' | 'wont_fix';

/**
 * Submit feedback (available to all authenticated staff)
 */
export async function submitFeedback(data: {
  type: FeedbackType;
  description: string;
  urgency?: FeedbackUrgency | null;
  isAnonymous: boolean;
  submitterId?: string | null;
  submitterName?: string | null;
  pageContext?: string | null;
}): Promise<Feedback> {
  const feedbackData: FeedbackInsert = {
    type: data.type,
    description: data.description,
    urgency: data.urgency || null,
    is_anonymous: data.isAnonymous,
    submitter_id: data.isAnonymous ? null : data.submitterId,
    submitter_name: data.isAnonymous ? null : data.submitterName,
    page_context: data.pageContext || null,
  };

  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert(feedbackData)
    .select()
    .single();

  if (error) {
    console.error('[Feedback] Error submitting feedback:', error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }

  if (!feedback) {
    throw new Error('Feedback submission failed');
  }

  return feedback;
}

/**
 * Get all feedback (manager-only, RLS enforced)
 * Returns feedback sorted by created_at descending (newest first)
 */
export async function getFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Feedback] Error fetching feedback:', error);
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  return data || [];
}

/**
 * Get feedback filtered by status (manager-only)
 */
export async function getFeedbackByStatus(status: FeedbackStatus): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Feedback] Error fetching feedback by status:', error);
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  return data || [];
}

/**
 * Update feedback status and/or notes (manager-only)
 */
export async function updateFeedbackStatus(
  id: string,
  updates: {
    status?: FeedbackStatus;
    notes?: string | null;
  }
): Promise<Feedback> {
  const updateData: FeedbackUpdate = {};
  
  if (updates.status) {
    updateData.status = updates.status;
    // Set reviewed_at when moving away from 'new'
    if (updates.status !== 'new') {
      updateData.reviewed_at = new Date().toISOString();
    }
  }
  
  if (updates.notes !== undefined) {
    updateData.notes = updates.notes;
  }

  const { data, error } = await supabase
    .from('feedback')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Feedback] Error updating feedback:', error);
    throw new Error(`Failed to update feedback: ${error.message}`);
  }

  if (!data) {
    throw new Error('Feedback not found or update failed');
  }

  return data;
}

/**
 * Get count of new (unreviewed) feedback (manager-only)
 */
export async function getNewFeedbackCount(): Promise<number> {
  const { count, error } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  if (error) {
    console.error('[Feedback] Error getting new feedback count:', error);
    return 0;
  }

  return count || 0;
}

