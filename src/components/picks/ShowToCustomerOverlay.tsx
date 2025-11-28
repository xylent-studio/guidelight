import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryChipsRow } from '@/components/ui/CategoryChipsRow';
import { GuestPickCard } from '@/components/picks/GuestPickCard';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface ShowToCustomerOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Close the overlay */
  onClose: () => void;
  /** Staff member's name */
  userName: string;
  /** Picks to display */
  picks: Pick[];
  /** Categories for filtering */
  categories: Category[];
}

/**
 * Full-screen overlay for showing picks to customers.
 * Used by staff on their phone to quickly show their picks.
 * Uses the same GuestPickCard and responsive layout as Display Mode.
 */
export function ShowToCustomerOverlay({
  isOpen,
  onClose,
  userName,
  picks,
  categories,
}: ShowToCustomerOverlayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Reset category filter when overlay opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
    }
  }, [isOpen]);

  // Filter picks by category
  const filteredPicks = selectedCategory
    ? picks.filter(pick => pick.category_id === selectedCategory)
    : picks;

  // Sort picks: rating desc, then updated_at desc
  const sortedPicks = [...filteredPicks].sort((a, b) => {
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    if (ratingB !== ratingA) return ratingB - ratingA;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {userName}'s picks
            </h1>
            <p className="text-sm text-muted-foreground">
              Showing to customer
            </p>
          </div>
        </div>
        <Button variant="default" size="sm" onClick={onClose}>
          Done
        </Button>
      </header>

      {/* Category Chips */}
      <div className="bg-background border-b border-border px-4 py-3">
        <CategoryChipsRow
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Picks Grid */}
      <main className="flex-1 overflow-auto px-4 py-6">
        {sortedPicks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedCategory
                ? 'No picks in this category.'
                : 'No picks to show yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {sortedPicks.map(pick => (
              <GuestPickCard key={pick.id} pick={pick} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Tap "Done" to return to your picks
        </p>
      </footer>
    </div>
  );
}

export default ShowToCustomerOverlay;

