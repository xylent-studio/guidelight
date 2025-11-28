import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL. See README for environment setup instructions.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. See README for environment setup instructions.');
}

// Key to store the "remember me" preference
const REMEMBER_ME_KEY = 'guidelight_remember_me';

// SSR/test safety check (Issue 6 fix)
const isBrowser = typeof window !== 'undefined';

/**
 * Get whether "remember me" is enabled.
 * Defaults to true for better UX on personal devices.
 * Returns true in non-browser environments (SSR/tests) for consistent behavior.
 */
export function getRememberMe(): boolean {
  if (!isBrowser) return true;
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
}

/**
 * Set the "remember me" preference.
 * When false, session will be cleared when browser closes.
 * No-op in non-browser environments (SSR/tests).
 */
export function setRememberMe(remember: boolean): void {
  if (!isBrowser) return;
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.setItem(REMEMBER_ME_KEY, 'false');
  }
}

/**
 * Custom storage adapter that routes to localStorage or sessionStorage
 * based on the "remember me" preference.
 * 
 * - Remember me ON: Uses localStorage (persists across browser sessions)
 * - Remember me OFF: Uses sessionStorage (cleared when browser closes)
 * - SSR/tests: Returns null/no-op to prevent errors (Issue 6 fix)
 */
const adaptiveStorage = {
  getItem: (key: string): string | null => {
    // SSR/test safety: return null if not in browser
    if (!isBrowser) return null;
    
    // Always check localStorage first for the preference key
    if (key === REMEMBER_ME_KEY) {
      return localStorage.getItem(key);
    }
    
    // For auth data, use the appropriate storage based on preference
    const rememberMe = getRememberMe();
    if (rememberMe) {
      return localStorage.getItem(key);
    } else {
      // Check sessionStorage first, fall back to localStorage for migration
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) return sessionValue;
      // If they previously had "remember me" on and switched it off,
      // we still need to read from localStorage once
      return localStorage.getItem(key);
    }
  },
  
  setItem: (key: string, value: string): void => {
    // SSR/test safety: no-op if not in browser
    if (!isBrowser) return;
    
    const rememberMe = getRememberMe();
    if (rememberMe) {
      localStorage.setItem(key, value);
      // Clean up sessionStorage if switching from session-only
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      // Clean up localStorage if switching to session-only (but keep preference)
      if (key !== REMEMBER_ME_KEY) {
        localStorage.removeItem(key);
      }
    }
  },
  
  removeItem: (key: string): void => {
    // SSR/test safety: no-op if not in browser
    if (!isBrowser) return;
    
    // Remove from both to ensure cleanup
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storage: adaptiveStorage,
  },
});

export type SupabaseClient = typeof supabase;

/**
 * Helper to create a fetch with timeout
 * Use this for critical operations that shouldn't hang
 * Accepts PromiseLike to work with Supabase query builders (Issue 10 fix)
 */
export function fetchWithTimeout<T>(
  promiseLike: PromiseLike<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

