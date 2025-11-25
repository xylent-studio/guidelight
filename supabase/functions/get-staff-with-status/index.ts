// Supabase Edge Function: get-staff-with-status
// Returns all staff members with their invite/auth status (manager-only)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StaffWithStatus {
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header (user's JWT)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header. Please log in.')
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.replace('Bearer ', '')

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error('Missing environment variables');
    }

    // Create a Supabase client with the user's JWT (for auth check and RLS)
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the calling user's JWT is valid
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Authentication failed. Please log in again.')
    }

    // Check if user is a manager
    const { data: callerProfile, error: profileError } = await supabaseClient
      .from('budtenders')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !callerProfile) {
      throw new Error('Could not verify your permissions.')
    }

    if (callerProfile.role !== 'manager') {
      throw new Error('Only managers can view staff status.')
    }

    // Create admin client to access auth.users
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get all budtenders
    const { data: budtenders, error: budtendersError } = await supabaseAdmin
      .from('budtenders')
      .select('*')
      .order('name', { ascending: true })

    if (budtendersError) {
      throw new Error(`Failed to fetch staff: ${budtendersError.message}`)
    }

    // Get auth users for each budtender
    const staffWithStatus: StaffWithStatus[] = await Promise.all(
      (budtenders || []).map(async (budtender) => {
        let email: string | null = null;
        let email_confirmed_at: string | null = null;
        let invited_at: string | null = null;
        let last_sign_in_at: string | null = null;
        let invite_status: 'not_invited' | 'pending' | 'active' = 'not_invited';

        if (budtender.auth_user_id) {
          try {
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
              budtender.auth_user_id
            )

            if (!authError && authUser?.user) {
              email = authUser.user.email || null;
              email_confirmed_at = authUser.user.email_confirmed_at || null;
              invited_at = authUser.user.invited_at || null;
              last_sign_in_at = authUser.user.last_sign_in_at || null;

              // Derive invite status
              if (email_confirmed_at) {
                invite_status = 'active';
              } else if (invited_at) {
                invite_status = 'pending';
              } else {
                invite_status = 'not_invited';
              }
            }
          } catch (e) {
            console.error(`Failed to get auth user for ${budtender.id}:`, e);
          }
        }

        return {
          ...budtender,
          email,
          email_confirmed_at,
          invited_at,
          last_sign_in_at,
          invite_status,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: staffWithStatus,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('[Edge Function] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

