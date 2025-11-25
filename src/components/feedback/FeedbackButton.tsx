import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';
import { feedback as feedbackCopy } from '@/lib/copy';

interface FeedbackButtonProps {
  /** Current page context to include in feedback submission */
  pageContext?: string;
}

/**
 * Floating feedback button that appears in the bottom-right corner.
 * Opens the feedback modal when clicked.
 */
export function FeedbackButton({ pageContext }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          title={feedbackCopy.button.tooltip}
        >
          <MessageCircle 
            size={24} 
            className="group-hover:scale-110 transition-transform" 
          />
          <span className="sr-only">{feedbackCopy.button.label}</span>
        </Button>
        
        {/* Tooltip on hover - visible on larger screens */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-bg-surface border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-default whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block shadow-md">
          {feedbackCopy.button.tooltip}
        </span>
      </div>

      {/* Feedback modal */}
      <FeedbackModal
        open={isOpen}
        onOpenChange={setIsOpen}
        pageContext={pageContext}
      />
    </>
  );
}

