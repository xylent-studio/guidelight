import { Loader2, Check, AlertCircle } from 'lucide-react';

type SaveStatusIndicatorProps = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
};

export function SaveStatusIndicator({ status, className = '' }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {status === 'saving' && (
        <>
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check size={14} className="text-green-500" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle size={14} className="text-destructive" />
          <span className="text-destructive">Error saving</span>
        </>
      )}
    </div>
  );
}

