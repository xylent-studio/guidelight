import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences } from '@/lib/api/userPreferences';
import { hasUnseenRelease } from '@/lib/api/releases';

/**
 * Hook to check if user has unseen release
 * Returns boolean for notification dot display
 */
export function useNewReleaseIndicator() {
  const { profile } = useAuth();
  const [hasNew, setHasNew] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      const prefs = await getUserPreferences(profile.id);
      const unseen = await hasUnseenRelease(prefs?.last_seen_release_id || null);
      setHasNew(unseen);
      setLoading(false);
    }
    
    check();
  }, [profile?.id]);

  return { hasNew, loading };
}

