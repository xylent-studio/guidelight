import { supabase, fetchWithTimeout } from '../supabaseClient';
import type { Database } from '@/types';

type BudtenderRole = Database['public']['Tables']['budtenders']['Row']['role'];

export interface InviteStaffData {
  email: string;
  name: string;
  role: BudtenderRole;
  location?: string | null;
  profile_expertise?: string | null;
  profile_vibe?: string | null;
  profile_tolerance?: string | null;
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

// Dev-only logging helper (Issue 9 fix - prevents PII leakage in production)
const isDev = import.meta.env.DEV;

// Timeout for invite API call (Issue 10 fix)
const INVITE_TIMEOUT_MS = 30000; // 30 seconds for invite (includes email sending)

/**
 * Invite a new staff member using the Edge Function
 * This creates the auth user, sends invite email, and creates budtender profile - all in one call
 */
export async function inviteStaff(data: InviteStaffData): Promise<InviteStaffResponse> {
  try {
    if (isDev) {
      console.log('[Invite] Calling Edge Function with data:', { name: data.name, role: data.role });
    }
    
    // Wrap with timeout to prevent hanging requests (Issue 10 fix)
    const { data: functionData, error } = await fetchWithTimeout(
      supabase.functions.invoke('invite-staff', {
        body: data,
      }),
      INVITE_TIMEOUT_MS
    );

    if (isDev) {
      console.log('[Invite] Raw response - data:', functionData);
      console.log('[Invite] Raw response - error:', error);
    }

    // If there's an error from the fetch itself
    if (error) {
      if (isDev) {
        console.error('[Invite] Edge function HTTP error:', error);
      }
      
      // Try to get the actual error message from the function response
      // The error might have a context property with the Response object
      if (error.context && error.context instanceof Response) {
        if (isDev) {
          console.log('[Invite] Error context is a Response, extracting body...');
        }
        try {
          const errorBody = await error.context.json();
          if (isDev) {
            console.log('[Invite] Error response body:', errorBody);
          }
          
          if (errorBody && typeof errorBody === 'object' && 'error' in errorBody) {
            throw new Error(errorBody.error);
          }
        } catch (parseError) {
          if (isDev) {
            console.error('[Invite] Failed to parse error response:', parseError);
          }
        }
      }
      
      // If functionData exists even with error, it might have our error message
      if (functionData) {
        if (isDev) {
          console.log('[Invite] Function data despite error:', functionData);
        }
        if (typeof functionData === 'object' && 'error' in functionData) {
          throw new Error(functionData.error as string);
        }
      }
      
      throw new Error('Edge Function returned an error. Check console for details.');
    }

    if (!functionData) {
      throw new Error('No response from Edge Function');
    }

    // Log the full response for debugging (dev only)
    if (isDev) {
      console.log('[Invite] Full response:', JSON.stringify(functionData, null, 2));
    }

    // Check if response indicates failure
    if (typeof functionData === 'object' && 'success' in functionData && !functionData.success) {
      if (isDev) {
        console.error('[Invite] Function returned error:', functionData.error);
      }
      throw new Error(functionData.error || 'Failed to invite staff member');
    }

    return functionData as InviteStaffResponse;
  } catch (err: unknown) {
    if (isDev) {
      console.error('[Invite] Failed to invite staff:', err);
    }
    throw err; // Re-throw the original error, don't wrap it
  }
}

