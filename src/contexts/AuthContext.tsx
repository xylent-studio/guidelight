import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserProfile, type Budtender } from '@/lib/api/auth';

interface AuthContextValue {
  user: User | null;
  profile: Budtender | null;
  loading: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Budtender | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived state: check if user is a manager
  const isManager = profile?.role === 'manager';

  // Load session and profile on mount
  useEffect(() => {
    // Set a timeout to ensure loading doesn't hang forever
    const timeoutId = setTimeout(() => {
      console.error('Auth check timeout - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    checkSession().finally(() => {
      clearTimeout(timeoutId);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          // Profile should still be valid, but reload to be safe
          await loadProfile();
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    console.log('[Auth] Starting session check...');
    try {
      setLoading(true);
      console.log('[Auth] Calling supabase.auth.getSession()...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[Auth] Session response:', { hasSession: !!session, error });
      
      if (error) {
        console.error('[Auth] Session check error:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('[Auth] User found, loading profile...');
        setUser(session.user);
        await loadProfile();
        console.log('[Auth] Profile loaded successfully');
      } else {
        console.log('[Auth] No session found, showing login');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('[Auth] Failed to check session:', error);
      setUser(null);
      setProfile(null);
    } finally {
      console.log('[Auth] Session check complete, setting loading to false');
      setLoading(false);
    }
  }

  async function loadProfile() {
    console.log('[Auth] Loading profile...');
    try {
      const budtenderProfile = await getCurrentUserProfile();
      console.log('[Auth] Profile fetched:', budtenderProfile);
      setProfile(budtenderProfile);
    } catch (error) {
      console.error('[Auth] Failed to load user profile:', error);
      // User exists but no budtender profile - should not happen in production
      // For now, we'll log them out
      try {
        console.log('[Auth] Signing out user with no profile...');
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('[Auth] Sign out error:', signOutError);
      }
      setUser(null);
      setProfile(null);
      alert('Your account is not properly set up. Please contact an administrator.');
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      await loadProfile();
    }
  }

  async function signOut() {
    console.log('[Auth] Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Sign out error:', error);
        throw error;
      }
      console.log('[Auth] Sign out successful, clearing state...');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('[Auth] Sign out failed:', error);
      throw error;
    }
  }

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isManager,
    signIn,
    signOut,
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

