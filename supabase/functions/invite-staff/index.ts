// Supabase Edge Function: invite-staff
// Creates auth user + budtender profile + sends invite email (manager-only)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteStaffRequest {
  email: string;
  name: string;
  role: 'budtender' | 'vault_tech' | 'manager';
  archetype?: string | null;
  ideal_high?: string | null;
  tolerance_level?: string | null;
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
    
    if (userError) {
      console.error('[Edge Function] getUser error:', userError)
      throw new Error(`Authentication failed: ${userError.message}`)
    }
    
    if (!user) {
      throw new Error('No user found. Please log in again.')
    }

    console.log('[Edge Function] Authenticated user:', user.id)

    // Check if user is a manager (RLS will apply here)
    const { data: callerProfile, error: profileError } = await supabaseClient
      .from('budtenders')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError) {
      console.error('[Edge Function] Profile fetch error:', profileError)
      throw new Error('Could not verify your permissions. Please contact support.')
    }

    if (!callerProfile) {
      throw new Error('No profile found for your account. Please contact support.')
    }

    if (callerProfile.role !== 'manager') {
      throw new Error(`Only managers can invite staff. Your role: ${callerProfile.role}`)
    }

    console.log('[Edge Function] Manager verified:', user.id)

    // Parse request body
    const body: InviteStaffRequest = await req.json()
    const { email, name, role, archetype, ideal_high, tolerance_level } = body

    // Validate required fields
    if (!email || !name || !role) {
      throw new Error('Missing required fields: email, name, role')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    console.log('[Edge Function] Creating auth user for:', email)

    // Create Supabase Admin client (service role)
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

    // Step 1: Create auth user and send invite email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          role,
        },
      }
    )

    if (authError) {
      console.error('[Edge Function] Auth creation error:', authError)
      // Check for duplicate email
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        throw new Error(`Email ${email} is already registered. Please use a different email.`)
      }
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user: No user returned')
    }

    console.log('[Edge Function] Auth user created:', authData.user.id)

    // Step 2: Create budtender profile linked to auth user
    const { data: budtenderData, error: budtenderError } = await supabaseAdmin
      .from('budtenders')
      .insert({
        auth_user_id: authData.user.id,
        name,
        role,
        archetype: archetype || null,
        ideal_high: ideal_high || null,
        tolerance_level: tolerance_level || null,
        is_active: true,
      })
      .select()
      .single()

    if (budtenderError) {
      console.error('[Edge Function] Profile creation error:', budtenderError)
      // Rollback: Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create budtender profile: ${budtenderError.message}`)
    }

    console.log('[Edge Function] Budtender profile created:', budtenderData.id)

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          auth_user_id: authData.user.id,
          budtender_id: budtenderData.id,
          name,
          email,
          role,
        },
        message: `Successfully invited ${name}. An invite email has been sent to ${email}.`,
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
