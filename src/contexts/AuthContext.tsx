import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Budtender } from '@/lib/api/auth';

// Retry configuration for network failures
const MAX_PROFILE_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second between retries

interface AuthContextValue {
  user: Session['user'] | null;
  profile: Budtender | null;
  loading: boolean;
  profileError: string | null;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  // Store session (not just user) for proper state management
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Budtender | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Derived state
  const user = session?.user ?? null;
  const isManager = profile?.role === 'manager';

  // Effect 1: Session management (official Supabase pattern)
  // - Fetch session once on mount
  // - Subscribe to auth changes (NO async work in callback)
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] Initial session error:', error);
      }
      setSession(session);
      // If no session, we're done loading immediately
      if (!session) {
        setLoading(false);
      }
    });

    // Subscribe to auth state changes
    // IMPORTANT: Only set state here, no async work
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] Auth state changed:', event);
        setSession(session);
        
        // On sign out, clear profile immediately
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProfileError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effect 2: Profile loading (reactive to session changes)
  // This is the key pattern - profile loads AFTER session is set
  useEffect(() => {
    if (session?.user) {
      loadProfile(session.user.id);
    } else {
      // No session = no profile, done loading
      setProfile(null);
      setProfileError(null);
      setLoading(false);
    }
  }, [session]);

  // Track retry attempts
  const retryCountRef = useRef(0);

  // Load profile by user ID with retry logic for network failures
  async function loadProfile(userId: string, isRetry = false) {
    if (!isRetry) {
      retryCountRef.current = 0;
    }
    
    console.log('[Auth] Loading profile for user:', userId, isRetry ? `(retry ${retryCountRef.current})` : '');
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const { data: budtenderProfile, error } = await supabase
        .from('budtenders')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        // Check if this is a network/connection error (retryable)
        const isNetworkError = error.message?.includes('fetch') || 
                               error.message?.includes('network') ||
                               error.code === 'PGRST301'; // Connection error
        
        if (isNetworkError && retryCountRef.current < MAX_PROFILE_RETRIES) {
          retryCountRef.current++;
          console.log(`[Auth] Network error, retrying in ${RETRY_DELAY_MS}ms...`);
          setTimeout(() => loadProfile(userId, true), RETRY_DELAY_MS);
          return; // Don't set error yet, we're retrying
        }
        
        // Check if this is an auth error (token expired/invalid)
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          console.error('[Auth] Auth token error, signing out...');
          await supabase.auth.signOut();
          return;
        }
        
        console.error('[Auth] Profile fetch error:', error);
        setProfileError('Unable to load your profile. Please try refreshing the page.');
        setProfile(null);
      } else if (!budtenderProfile) {
        // User exists but no budtender profile - this is a data issue, not retryable
        setProfileError('Your account is not fully set up. Please contact an administrator.');
        setProfile(null);
      } else {
        console.log('[Auth] Profile loaded:', budtenderProfile.name);
        setProfile(budtenderProfile);
        setProfileError(null);
        retryCountRef.current = 0; // Reset on success
      }
    } catch (error) {
      // Catch network errors that throw exceptions
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isNetworkError = errorMessage.includes('fetch') || 
                             errorMessage.includes('network') ||
                             errorMessage.includes('Failed to fetch');
      
      if (isNetworkError && retryCountRef.current < MAX_PROFILE_RETRIES) {
        retryCountRef.current++;
        console.log(`[Auth] Network exception, retrying in ${RETRY_DELAY_MS}ms...`);
        setTimeout(() => loadProfile(userId, true), RETRY_DELAY_MS);
        return;
      }
      
      console.error('[Auth] Unexpected error loading profile:', error);
      
      // After all retries exhausted, if still network error, sign out
      if (isNetworkError && retryCountRef.current >= MAX_PROFILE_RETRIES) {
        console.error('[Auth] Max retries reached, signing out...');
        setProfileError('Connection lost. Please sign in again.');
        await supabase.auth.signOut();
        return;
      }
      
      setProfileError('An unexpected error occurred. Please try again.');
      setProfile(null);
    } finally {
      // Only set loading false if we're not retrying
      if (retryCountRef.current === 0 || retryCountRef.current >= MAX_PROFILE_RETRIES) {
        setProfileLoading(false);
        setLoading(false);
      }
    }
  }

  // Refresh profile function - exposed to components
  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  }, [session]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    // Session will be updated by onAuthStateChange, which triggers profile load
  }

  async function signOut() {
    console.log('[Auth] Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Sign out error:', error);
      throw error;
    }
    // State will be cleared by onAuthStateChange callback
  }

  const value: AuthContextValue = {
    user,
    profile,
    loading: loading || profileLoading,
    profileError,
    isManager,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
