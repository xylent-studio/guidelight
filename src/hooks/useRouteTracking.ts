import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateLastRoute } from '@/lib/api/userPreferences';

// Routes that are meaningful to track for "resume where I left off"
const TRACKABLE_ROUTES = ['/', '/boards', '/team', '/preferences'];

// Debounce delay to avoid excessive API calls during rapid navigation
const DEBOUNCE_MS = 1000;

/**
 * Hook to track the user's last visited route
 * Updates user_preferences.last_route on navigation changes
 */
export function useRouteTracking() {
  const location = useLocation();
  const { profile } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!profile?.id) return;
    
    // Check if this is a trackable route
    const isTrackable = TRACKABLE_ROUTES.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );
    
    if (!isTrackable) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounce the update
    timerRef.current = setTimeout(() => {
      updateLastRoute(profile.id, location.pathname);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname, profile?.id]);
}

