import { supabase } from '../supabaseClient';
import type { Database } from '@/types';

type BudtenderRole = Database['public']['Tables']['budtenders']['Row']['role'];

export interface InviteStaffData {
  email: string;
  name: string;
  role: BudtenderRole;
  location?: string | null;
  archetype?: string | null;
  ideal_high?: string | null;
  tolerance_level?: string | null;
}

export interface InviteStaffResponse {
  success: boolean;
  data?: {
    auth_user_id: string;
    budtender_id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
  error?: string;
}

/**
 * Invite a new staff member using the Edge Function
 * This creates the auth user, sends invite email, and creates budtender profile - all in one call
 */
export async function inviteStaff(data: InviteStaffData): Promise<InviteStaffResponse> {
  try {
    console.log('[Invite] Calling Edge Function with data:', { ...data, email: data.email });
    
    const { data: functionData, error } = await supabase.functions.invoke('invite-staff', {
      body: data,
    });

    console.log('[Invite] Raw response - data:', functionData);
    console.log('[Invite] Raw response - error:', error);

    // If there's an error from the fetch itself
    if (error) {
      console.error('[Invite] Edge function HTTP error:', error);
      
      // Try to get the actual error message from the function response
      // The error might have a context property with the Response object
      if (error.context && error.context instanceof Response) {
        console.log('[Invite] Error context is a Response, extracting body...');
        try {
          const errorBody = await error.context.json();
          console.log('[Invite] Error response body:', errorBody);
          
          if (errorBody && typeof errorBody === 'object' && 'error' in errorBody) {
            throw new Error(errorBody.error);
          }
        } catch (parseError) {
          console.error('[Invite] Failed to parse error response:', parseError);
        }
      }
      
      // If functionData exists even with error, it might have our error message
      if (functionData) {
        console.log('[Invite] Function data despite error:', functionData);
        if (typeof functionData === 'object' && 'error' in functionData) {
          throw new Error(functionData.error as string);
        }
      }
      
      throw new Error('Edge Function returned an error. Check console for details.');
    }

    if (!functionData) {
      throw new Error('No response from Edge Function');
    }

    // Log the full response for debugging
    console.log('[Invite] Full response:', JSON.stringify(functionData, null, 2));

    // Check if response indicates failure
    if (typeof functionData === 'object' && 'success' in functionData && !functionData.success) {
      console.error('[Invite] Function returned error:', functionData.error);
      throw new Error(functionData.error || 'Failed to invite staff member');
    }

    return functionData as InviteStaffResponse;
  } catch (err: any) {
    console.error('[Invite] Failed to invite staff:', err);
    throw err; // Re-throw the original error, don't wrap it
  }
}

