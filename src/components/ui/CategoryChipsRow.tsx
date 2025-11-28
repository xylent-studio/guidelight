import { useRef, useEffect } from 'react';
import type { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryChipsRowProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  /** Label for "All" chip (default: "All") */
  allLabel?: string;
  /** Class name for the container */
  className?: string;
}

/**
 * Horizontal scrollable category chips row (like Dispense/AIQ).
 * "All" is first and selected by default.
 * Smooth horizontal scroll on mobile with touch support.
 */
export function CategoryChipsRow({
  categories,
  selectedCategory,
  onSelectCategory,
  allLabel = 'All',
  className = '',
}: CategoryChipsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll selected chip into view when selection changes
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const selectedChip = container.querySelector('[data-selected="true"]') as HTMLElement;
    
    if (selectedChip) {
      const containerRect = container.getBoundingClientRect();
      const chipRect = selectedChip.getBoundingClientRect();
      
      // Check if chip is outside visible area
      if (chipRect.left < containerRect.left || chipRect.right > containerRect.right) {
        selectedChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedCategory]);

  return (
    <div 
      ref={scrollRef}
      className={`
        flex gap-2 overflow-x-auto pb-1
        scroll-smooth scrollbar-hide
        ${className}
      `}
      style={{ 
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Edge padding for first chip */}
      <div className="shrink-0 w-0.5" aria-hidden="true" />
      
      {/* All chip */}
      <button
        data-selected={selectedCategory === null}
        onClick={() => onSelectCategory(null)}
        className={`
          px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium 
          whitespace-nowrap transition-all duration-200 shrink-0
          active:scale-95 touch-manipulation
          ${selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }
        `}
      >
        {allLabel}
      </button>

      {/* Category chips */}
      {categories.map(category => (
        <button
          key={category.id}
          data-selected={selectedCategory === category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`
            px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium 
            whitespace-nowrap transition-all duration-200 shrink-0
            active:scale-95 touch-manipulation
            ${selectedCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }
          `}
        >
          {category.name}
        </button>
      ))}
      
      {/* Edge padding for last chip */}
      <div className="shrink-0 w-0.5" aria-hidden="true" />
    </div>
  );
}

export default CategoryChipsRow;

