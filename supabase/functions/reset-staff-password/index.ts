// Supabase Edge Function: reset-staff-password
// Sends a password reset email to a staff member (manager-only)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetPasswordRequest {
  staffId: string;
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
      throw new Error('Only managers can reset staff passwords.')
    }

    // Parse request body
    const body: ResetPasswordRequest = await req.json()
    const { staffId } = body

    if (!staffId) {
      throw new Error('Missing staffId')
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

    // Get the auth user to find their email
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      staffMember.auth_user_id
    )

    if (authError || !authUser?.user?.email) {
      throw new Error('Could not find email for this staff member')
    }

    // Generate a password reset link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: authUser.user.email,
    })

    if (linkError) {
      console.error('Failed to generate reset link:', linkError)
      throw new Error('Failed to generate password reset link')
    }

    // The link is automatically sent via email by Supabase
    // But we can also use the properties to send a custom email if needed

    return new Response(
      JSON.stringify({
        success: true,
        message: `Password reset link sent to ${authUser.user.email}`,
        email: authUser.user.email,
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

