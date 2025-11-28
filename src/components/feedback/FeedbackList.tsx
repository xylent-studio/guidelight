import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Lightbulb, Sparkles, MessageCircle, HelpCircle, AlertTriangle, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { getFeedback, updateFeedbackStatus, type FeedbackStatus } from '@/lib/api/feedback';
import { feedback as feedbackCopy } from '@/lib/copy';
import { format, formatDistanceToNow } from 'date-fns';
import type { Database } from '@/types/database';

type Feedback = Database['public']['Tables']['feedback']['Row'];

type FilterMode = 'all' | 'new' | 'in_progress' | 'done';

// Type icons mapping
const typeIcons: Record<string, typeof Bug> = {
  bug: Bug,
  suggestion: Lightbulb,
  feature: Sparkles,
  general: MessageCircle,
  other: HelpCircle,
};

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  bug: 'bg-red-100 text-red-800',
  suggestion: 'bg-blue-100 text-blue-800',
  feature: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-800',
};

// Urgency badge colors
const urgencyBadgeColors: Record<string, string> = {
  noting: 'bg-gray-100 text-gray-600',
  nice_to_have: 'bg-blue-100 text-blue-700',
  annoying: 'bg-amber-100 text-amber-700',
  blocking: 'bg-red-100 text-red-800',
};

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());

  const copy = feedbackCopy.management;

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    setLoading(true);
    setError(null);

    try {
      const data = await getFeedback();
      setFeedback(data);
    } catch (err) {
      console.error('[FeedbackList] Error loading:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: FeedbackStatus) {
    setUpdatingStatus((prev) => new Set(prev).add(id));

    try {
      await updateFeedbackStatus(id, { status });
      
      // Update local state
      setFeedback((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status, reviewed_at: status !== 'new' ? new Date().toISOString() : f.reviewed_at }
            : f
        )
      );
    } catch (err) {
      console.error('[FeedbackList] Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleSaveNotes(id: string) {
    const notes = editingNotes[id];
    if (notes === undefined) return;

    setSavingNotes((prev) => new Set(prev).add(id));

    try {
      await updateFeedbackStatus(id, { notes });
      
      // Update local state
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, notes } : f))
      );
      
      // Clear editing state
      setEditingNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error('[FeedbackList] Error saving notes:', err);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function startEditingNotes(item: Feedback) {
    setEditingNotes((prev) => ({
      ...prev,
      [item.id]: item.notes || '',
    }));
  }

  // Filter feedback
  const filteredFeedback = feedback.filter((f) => {
    if (filter === 'new') return f.status === 'new';
    if (filter === 'in_progress') return f.status === 'in_progress' || f.status === 'reviewed';
    if (filter === 'done') return f.status === 'done' || f.status === 'wont_fix';
    return true;
  });

  // Counts
  const newCount = feedback.filter((f) => f.status === 'new').length;
  const inProgressCount = feedback.filter((f) => f.status === 'in_progress' || f.status === 'reviewed').length;
  const doneCount = feedback.filter((f) => f.status === 'done' || f.status === 'wont_fix').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground">Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadFeedback} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{copy.title}</h2>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
        <TabsList>
          <TabsTrigger value="all">
            {copy.filters.all} ({feedback.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            {copy.filters.new} ({newCount})
            {newCount > 0 && <span className="ml-1.5 w-2 h-2 bg-primary rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            {copy.filters.in_progress} ({inProgressCount})
          </TabsTrigger>
          <TabsTrigger value="done">
            {copy.filters.done} ({doneCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">{copy.empty}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => {
            const TypeIcon = typeIcons[item.type] || HelpCircle;
            const isExpanded = expandedIds.has(item.id);
            const isEditingNotes = editingNotes[item.id] !== undefined;
            const isSavingNotes = savingNotes.has(item.id);
            const isUpdatingStatus = updatingStatus.has(item.id);

            return (
              <Card key={item.id} className={item.status === 'done' || item.status === 'wont_fix' ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Type Icon */}
                      <div className={`p-2 rounded-md ${typeBadgeColors[item.type]}`}>
                        <TypeIcon size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Type & Urgency Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={typeBadgeColors[item.type]}>
                            {feedbackCopy.modal.types[item.type as keyof typeof feedbackCopy.modal.types]?.label || item.type}
                          </Badge>
                          {item.urgency && (
                            <Badge className={urgencyBadgeColors[item.urgency]}>
                              {feedbackCopy.modal.urgencies[item.urgency as keyof typeof feedbackCopy.modal.urgencies]?.label || item.urgency}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Submitter & Time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={item.is_anonymous ? 'italic' : 'font-medium'}>
                            {item.is_anonymous ? copy.anonymous : item.submitter_name}
                          </span>
                          <span>·</span>
                          <span title={format(new Date(item.created_at), 'PPpp')}>
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                          {item.page_context && (
                            <>
                              <span>·</span>
                              <span className="text-muted-foreground/70">on {item.page_context}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div className="shrink-0">
                      <Select
                        value={item.status}
                        onValueChange={(v) => handleStatusChange(item.id, v as FeedbackStatus)}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(copy.statusLabels) as [FeedbackStatus, string][]).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Description - truncated or full */}
                  <div>
                    <p className={`text-sm text-foreground whitespace-pre-wrap ${!isExpanded && item.description.length > 200 ? 'line-clamp-3' : ''}`}>
                      {item.description}
                    </p>
                    {item.description.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-auto p-1 text-xs text-muted-foreground"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} className="mr-1" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} className="mr-1" /> Show more
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Internal Notes */}
                  <div className="pt-3 border-t border-border">
                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNotes[item.id]}
                          onChange={(e) =>
                            setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder={copy.notesPlaceholder}
                          rows={2}
                          className="text-sm resize-none"
                          disabled={isSavingNotes}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(item.id)}
                            disabled={isSavingNotes}
                          >
                            <Save size={14} className="mr-1" />
                            {isSavingNotes ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingNotes((prev) => {
                                const next = { ...prev };
                                delete next[item.id];
                                return next;
                              })
                            }
                            disabled={isSavingNotes}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-muted-foreground cursor-pointer hover:bg-card/50 p-2 rounded -m-2"
                        onClick={() => startEditingNotes(item)}
                      >
                        {item.notes ? (
                          <p className="whitespace-pre-wrap">{item.notes}</p>
                        ) : (
                          <p className="italic text-muted-foreground/60">{copy.notesPlaceholder}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Urgency warning */}
                  {item.urgency === 'blocking' && item.status === 'new' && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      <AlertTriangle size={16} />
                      <span>This is marked as blocking — someone can't do their job!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

