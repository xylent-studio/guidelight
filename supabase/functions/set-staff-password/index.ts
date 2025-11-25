// Supabase Edge Function: set-staff-password
// Allows managers to directly set a new password for a staff member

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SetPasswordRequest {
  staffId: string;
  newPassword: string;
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
      throw new Error('Only managers can set staff passwords.')
    }

    // Parse request body
    const body: SetPasswordRequest = await req.json()
    const { staffId, newPassword } = body

    if (!staffId) {
      throw new Error('Missing staffId')
    }

    if (!newPassword) {
      throw new Error('Missing newPassword')
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    // Create admin client
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

    // Get the staff member's budtender record
    const { data: staffMember, error: staffError } = await supabaseAdmin
      .from('budtenders')
      .select('auth_user_id, name')
      .eq('id', staffId)
      .single()

    if (staffError || !staffMember) {
      throw new Error('Staff member not found')
    }

    if (!staffMember.auth_user_id) {
      throw new Error('This staff member does not have an account yet')
    }

    // Directly update the user's password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      staffMember.auth_user_id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Failed to set password:', updateError)
      throw new Error('Failed to set password: ' + updateError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Password updated for ${staffMember.name}`,
        staffName: staffMember.name,
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

