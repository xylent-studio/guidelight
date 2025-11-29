import { useEffect, useRef, useState, useCallback } from 'react';
import { saveDraft, deleteDraft, type PickDraftRow } from '@/lib/api/drafts';

type UseDraftAutosaveOptions = {
  userId: string;
  pickId?: string;  // If editing existing pick
  initialDraft?: PickDraftRow;
  debounceMs?: number;
};

type UseDraftAutosaveReturn = {
  draft: PickDraftRow | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updateDraft: (data: Record<string, unknown>) => void;
  discardDraft: () => Promise<void>;
  isDirty: boolean;
};

export function useDraftAutosave({
  userId,
  pickId,
  initialDraft,
  debounceMs = 2000,
}: UseDraftAutosaveOptions): UseDraftAutosaveReturn {
  const [draft, setDraft] = useState<PickDraftRow | null>(initialDraft || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  
  const pendingDataRef = useRef<Record<string, unknown> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (data: Record<string, unknown>) => {
    const dataHash = JSON.stringify(data);
    if (dataHash === lastSavedDataRef.current) {
      return; // No changes since last save
    }
    
    setSaveStatus('saving');
    
    const saved = await saveDraft(userId, data, pickId, draft?.id);
    
    if (saved) {
      setDraft(saved);
      lastSavedDataRef.current = dataHash;
      setSaveStatus('saved');
      setIsDirty(false);
      
      // Reset to idle after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
    }
  }, [userId, pickId, draft?.id]);

  const updateDraft = useCallback((data: Record<string, unknown>) => {
    setIsDirty(true);
    pendingDataRef.current = data;
    
    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        performSave(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs, performSave]);

  const discardDraft = useCallback(async () => {
    if (draft?.id) {
      await deleteDraft(draft.id);
    }
    setDraft(null);
    setIsDirty(false);
    lastSavedDataRef.current = '';
  }, [draft?.id]);

  return {
    draft,
    saveStatus,
    updateDraft,
    discardDraft,
    isDirty,
  };
}

