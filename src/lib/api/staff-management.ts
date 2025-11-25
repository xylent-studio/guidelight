import { supabase } from '../supabaseClient';

export interface StaffWithStatus {
  id: string;
  auth_user_id: string;
  name: string;
  nickname: string | null;
  role: string;
  profile_expertise: string | null;
  profile_vibe: string | null;
  profile_tolerance: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Auth status fields
  email: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  last_sign_in_at: string | null;
  // Derived status
  invite_status: 'not_invited' | 'pending' | 'active';
}

interface GetStaffResponse {
  success: boolean;
  data?: StaffWithStatus[];
  error?: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  email?: string;
  staffName?: string;
  error?: string;
}

/**
 * Get all staff members with their auth/invite status
 * Manager-only endpoint
 */
export async function getStaffWithStatus(): Promise<StaffWithStatus[]> {
  try {
    const { data: functionData, error } = await supabase.functions.invoke('get-staff-with-status');

    if (error) {
      console.error('[Staff API] Edge function error:', error);
      
      // Try to extract error message from response
      if (error.context && error.context instanceof Response) {
        try {
          const errorBody = await error.context.json();
          if (errorBody?.error) {
            throw new Error(errorBody.error);
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      throw new Error('Failed to fetch staff status');
    }

    if (!functionData) {
      throw new Error('No response from server');
    }

    const response = functionData as GetStaffResponse;

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch staff');
    }

    return response.data || [];
  } catch (err) {
    console.error('[Staff API] Failed to get staff with status:', err);
    throw err;
  }
}

/**
 * Send a password reset email to a staff member
 * Manager-only endpoint
 */
export async function resetStaffPassword(staffId: string): Promise<ResetPasswordResponse> {
  try {
    const { data: functionData, error } = await supabase.functions.invoke('reset-staff-password', {
      body: { staffId },
    });

    if (error) {
      console.error('[Staff API] Edge function error:', error);
      
      // Try to extract error message from response
      if (error.context && error.context instanceof Response) {
        try {
          const errorBody = await error.context.json();
          if (errorBody?.error) {
            throw new Error(errorBody.error);
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      throw new Error('Failed to send password reset');
    }

    if (!functionData) {
      throw new Error('No response from server');
    }

    const response = functionData as ResetPasswordResponse;

    if (!response.success) {
      throw new Error(response.error || 'Failed to send password reset');
    }

    return response;
  } catch (err) {
    console.error('[Staff API] Failed to reset staff password:', err);
    throw err;
  }
}

/**
 * Format the invite status for display
 */
export function getStatusDisplay(status: StaffWithStatus['invite_status']): {
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  description: string;
} {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        variant: 'default',
        description: 'Account is set up and active',
      };
    case 'pending':
      return {
        label: 'Invite Pending',
        variant: 'secondary',
        description: 'Waiting for user to accept invite',
      };
    case 'not_invited':
    default:
      return {
        label: 'Not Invited',
        variant: 'outline',
        description: 'No invite has been sent',
      };
  }
}

/**
 * Format a date for display (e.g., "Nov 24, 8:15 PM")
 */
export function formatInviteDate(dateString: string | null): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

