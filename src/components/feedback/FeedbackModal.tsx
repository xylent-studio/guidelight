import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Send, Phone, Mail } from 'lucide-react';
import { submitFeedback, type FeedbackType, type FeedbackUrgency } from '@/lib/api/feedback';
import { useAuth } from '@/contexts/AuthContext';
import { feedback as feedbackCopy } from '@/lib/copy';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageContext?: string;
}

export function FeedbackModal({ open, onOpenChange, pageContext }: FeedbackModalProps) {
  const { profile } = useAuth();
  
  const [type, setType] = useState<FeedbackType | ''>('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<FeedbackUrgency | ''>('');
  const [includeMyName, setIncludeMyName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setType('');
    setDescription('');
    setUrgency('');
    setIncludeMyName(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
      // Reset form after close animation
      setTimeout(resetForm, 200);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!type) {
      setError('Pick a feedback type so we know what we\'re working with.');
      return;
    }
    if (!description.trim()) {
      setError('Tell us what\'s on your mind — even a sentence helps.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await submitFeedback({
        type: type as FeedbackType,
        description: description.trim(),
        urgency: urgency ? (urgency as FeedbackUrgency) : null,
        isAnonymous: !includeMyName,
        submitterId: profile?.id,
        submitterName: profile?.name,
        pageContext: pageContext || window.location.pathname,
      });

      setSuccess(true);
      
      // Close after showing success message
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('[Feedback] Submit error:', err);
      setError(feedbackCopy.error);
    } finally {
      setSubmitting(false);
    }
  };

  const copy = feedbackCopy.modal;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {success ? (
          // Success state
          <div className="py-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-lg font-semibold text-foreground mb-2">
              {feedbackCopy.success}
            </p>
          </div>
        ) : (
          // Form state
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{copy.title}</DialogTitle>
              <DialogDescription className="text-base">
                {copy.subtitle}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Type selector */}
              <div className="space-y-2">
                <Label htmlFor="feedback-type">
                  {copy.typeLabel} <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as FeedbackType)}
                  disabled={submitting}
                >
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(copy.types) as [FeedbackType, { label: string; description: string }][]).map(
                      ([key, { label, description }]) => (
                        <SelectItem key={key} value={key}>
                          <span className="font-medium">{label}</span>
                          <span className="text-muted-foreground ml-2">— {description}</span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="feedback-description">
                  {copy.descriptionLabel} <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={copy.descriptionPlaceholder}
                  rows={4}
                  disabled={submitting}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {copy.descriptionHelper}
                </p>
              </div>

              {/* Urgency (optional) */}
              <div className="space-y-2">
                <Label htmlFor="feedback-urgency">{copy.urgencyLabel}</Label>
                <Select
                  value={urgency}
                  onValueChange={(value) => setUrgency(value as FeedbackUrgency)}
                  disabled={submitting}
                >
                  <SelectTrigger id="feedback-urgency">
                    <SelectValue placeholder={copy.urgencyPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(copy.urgencies) as [FeedbackUrgency, { label: string; description: string }][]).map(
                      ([key, { label, description }]) => (
                        <SelectItem key={key} value={key}>
                          <span className="font-medium">{label}</span>
                          <span className="text-muted-foreground ml-2">— {description}</span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-start gap-3 pt-2">
                <Switch
                  id="include-name"
                  checked={includeMyName}
                  onCheckedChange={setIncludeMyName}
                  disabled={submitting}
                />
                <div>
                  <Label htmlFor="include-name" className="text-sm cursor-pointer">
                    {copy.anonymousLabel}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {copy.anonymousHelper}
                  </p>
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* Contact info */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">
                  {feedbackCopy.contact.heading}
                </p>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Phone size={14} />
                    {feedbackCopy.contact.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} />
                    {feedbackCopy.contact.email}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                {copy.cancel}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  copy.submitting
                ) : (
                  <>
                    <Send size={16} className="mr-1.5" />
                    {copy.submit}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

