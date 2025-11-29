import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, User, Check } from 'lucide-react';
import { getPublishedPicks } from '@/lib/api/picks';
import type { AttributionStyle } from '@/lib/api/boards';
import type { Database } from '@/types/database';

// Pick type with joined budtender name
type Pick = Database['public']['Tables']['picks']['Row'];
type PickWithBudtender = Pick & {
  budtenders?: { name: string } | null;
};

type AddPickDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectPick: (pick: PickWithBudtender, attributionStyle: AttributionStyle) => void;
  excludePickIds?: string[];
  boardOwnerId: string; // To determine if attribution is needed
};

/**
 * Dialog for adding a pick to a board.
 * Shows ALL published picks (not just user's own).
 * When selecting another user's pick, shows attribution style chooser.
 */
export function AddPickDialog({
  open,
  onClose,
  onSelectPick,
  excludePickIds = [],
  boardOwnerId,
}: AddPickDialogProps) {
  const [picks, setPicks] = useState<PickWithBudtender[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Attribution selection state (for someone else's pick)
  const [selectedPick, setSelectedPick] = useState<PickWithBudtender | null>(null);
  const [attributionStyle, setAttributionStyle] = useState<AttributionStyle>('subtle');

  useEffect(() => {
    if (open) {
      loadPicks();
      // Reset state when dialog opens
      setSelectedPick(null);
      setAttributionStyle('subtle');
      setSearch('');
    }
  }, [open]);

  async function loadPicks() {
    setLoading(true);
    // Load ALL published picks, not just user's own (Q1 answer)
    const data = await getPublishedPicks(100);
    setPicks(data as PickWithBudtender[]);
    setLoading(false);
  }

  const filteredPicks = picks
    .filter((p) => !excludePickIds.includes(p.id))
    .filter((p) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        p.product_name.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.budtenders?.name?.toLowerCase().includes(searchLower)
      );
    });

  const handlePickClick = (pick: PickWithBudtender) => {
    const isOwnPick = pick.budtender_id === boardOwnerId;

    if (isOwnPick) {
      // Own pick - no attribution needed, add directly
      onSelectPick(pick, null);
      onClose();
    } else {
      // Someone else's pick - show attribution chooser
      setSelectedPick(pick);
    }
  };

  const handleConfirmAttribution = () => {
    if (selectedPick) {
      onSelectPick(selectedPick, attributionStyle);
      onClose();
    }
  };

  const handleBack = () => {
    setSelectedPick(null);
  };

  // ===== Attribution Chooser View =====
  if (selectedPick) {
    const budtenderName = selectedPick.budtenders?.name || 'Unknown';
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {budtenderName}'s pick</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              How would you like to credit {budtenderName}?
            </p>

            {/* Attribution options - styled as selectable cards */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setAttributionStyle('prominent')}
                className={`
                  w-full text-left p-3 rounded-lg border transition-colors
                  ${attributionStyle === 'prominent' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:bg-accent'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Prominent</span>
                    <p className="text-sm text-muted-foreground">
                      "{budtenderName}'s Pick" as a header
                    </p>
                  </div>
                  {attributionStyle === 'prominent' && (
                    <Check size={18} className="text-primary" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAttributionStyle('subtle')}
                className={`
                  w-full text-left p-3 rounded-lg border transition-colors
                  ${attributionStyle === 'subtle' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:bg-accent'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Subtle</span>
                    <p className="text-sm text-muted-foreground">
                      "From {budtenderName}" as a footnote
                    </p>
                  </div>
                  {attributionStyle === 'subtle' && (
                    <Check size={18} className="text-primary" />
                  )}
                </div>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleConfirmAttribution}>Add to board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ===== Main Pick List View =====
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add pick to board</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search picks by name, brand, or budtender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Pick list - shows ALL published picks */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[400px]">
          {loading ? (
            <p className="text-muted-foreground text-center py-4">
              Loading picks...
            </p>
          ) : filteredPicks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {search ? 'No picks match your search' : 'No picks available'}
            </p>
          ) : (
            filteredPicks.map((pick) => {
              const isOwnPick = pick.budtender_id === boardOwnerId;
              const budtenderName = pick.budtenders?.name;

              return (
                <button
                  key={pick.id}
                  type="button"
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  onClick={() => handlePickClick(pick)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{pick.product_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        {pick.brand && <span>{pick.brand}</span>}
                        {budtenderName && !isOwnPick && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {budtenderName}
                          </span>
                        )}
                        {isOwnPick && (
                          <Badge variant="secondary" className="text-xs">
                            Your pick
                          </Badge>
                        )}
                      </div>
                    </div>
                    {pick.rating && (
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="text-sm">{pick.rating}</span>
                      </div>
                    )}
                  </div>
                  {pick.one_liner && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {pick.one_liner}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}



