import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  /** Current rating value (0.5-5 in half-star increments) or null for unrated */
  value: number | null;
  /** Callback when rating changes (omit for readonly display) */
  onChange?: (value: number | null) => void;
  /** Size of each star in pixels */
  size?: number;
  /** Additional className for the container */
  className?: string;
  /** Show dimmed stars for unrated (true) or hide stars entirely (false) */
  showEmpty?: boolean;
}

/**
 * StarRating component for displaying and optionally editing a 0.5-5 star rating.
 * Supports half-star increments.
 * 
 * Display mode (no onChange): Shows filled/half/empty stars based on value.
 * Input mode (with onChange): Clickable stars with left-half = X.5, right-half = X+1.
 *                             Click same position twice to clear to null.
 */
export function StarRating({
  value,
  onChange,
  size = 16,
  className,
  showEmpty = true,
}: StarRatingProps) {
  const isReadonly = !onChange;
  const stars = [1, 2, 3, 4, 5];

  // If no value and we don't want to show empty stars, hide entirely
  if (value === null && !showEmpty && isReadonly) {
    return null;
  }

  /**
   * For input mode: clicking left half of star N gives N-0.5, right half gives N
   */
  const handleClick = (starIndex: number, isLeftHalf: boolean) => {
    if (isReadonly || !onChange) return;
    
    const newValue = isLeftHalf ? starIndex - 0.5 : starIndex;
    
    // Click same value to clear rating
    if (value === newValue) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (isReadonly || !onChange) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Default keyboard interaction gives full star
      handleClick(starIndex, false);
    } else if (e.key === 'ArrowLeft' && value !== null && value > 0.5) {
      e.preventDefault();
      onChange(value - 0.5);
    } else if (e.key === 'ArrowRight' && (value === null || value < 5)) {
      e.preventDefault();
      onChange((value ?? 0) + 0.5);
    }
  };

  /**
   * Determine how to render each star position:
   * - 'full': completely filled
   * - 'half': half filled (left side)
   * - 'empty': not filled
   */
  const getStarState = (starIndex: number): 'full' | 'half' | 'empty' => {
    if (value === null) return 'empty';
    if (value >= starIndex) return 'full';
    if (value >= starIndex - 0.5) return 'half';
    return 'empty';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5',
        !isReadonly && 'cursor-pointer',
        className
      )}
      role={isReadonly ? 'img' : 'radiogroup'}
      aria-label={value ? `${value} out of 5 stars` : 'Not rated'}
    >
      {stars.map((starIndex) => {
        const state = getStarState(starIndex);
        
        if (isReadonly) {
          // Read-only display mode
          return (
            <span
              key={starIndex}
              className={cn(
                'relative transition-colors',
                state === 'empty' 
                  ? 'text-star-empty' 
                  : state === 'half'
                    ? 'text-star-half'
                    : 'text-star-filled'
              )}
            >
              {state === 'half' ? (
                // Half star: show half-filled icon
                <span className="relative">
                  {/* Empty star background */}
                  <Star
                    size={size}
                    fill="none"
                    strokeWidth={1.5}
                    className="text-star-empty"
                  />
                  {/* Half-filled overlay */}
                  <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star
                      size={size}
                      fill="currentColor"
                      strokeWidth={1.5}
                      className="text-star-filled"
                    />
                  </span>
                </span>
              ) : (
                <Star
                  size={size}
                  fill={state === 'full' ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              )}
            </span>
          );
        }
        
        // Interactive input mode with two click zones per star
        return (
          <span
            key={starIndex}
            className="relative"
            tabIndex={0}
            role="radio"
            aria-checked={state !== 'empty'}
            aria-label={`${starIndex} stars`}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
          >
            {/* Base star (visual) */}
            <span
              className={cn(
                'transition-colors',
                state === 'empty' 
                  ? 'text-star-empty' 
                  : state === 'half'
                    ? 'text-star-half'
                    : 'text-star-filled'
              )}
            >
              {state === 'half' ? (
                <span className="relative block">
                  <Star
                    size={size}
                    fill="none"
                    strokeWidth={1.5}
                    className="text-star-empty"
                  />
                  <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star
                      size={size}
                      fill="currentColor"
                      strokeWidth={1.5}
                      className="text-star-filled"
                    />
                  </span>
                </span>
              ) : (
                <Star
                  size={size}
                  fill={state === 'full' ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              )}
            </span>
            
            {/* Invisible click zones for left half (X.5) and right half (X) */}
            <span
              className="absolute inset-0 flex"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Left half - gives X.5 stars */}
              <span
                className="w-1/2 h-full hover:opacity-80 cursor-pointer"
                onClick={() => handleClick(starIndex, true)}
                title={`${starIndex - 0.5} stars`}
              />
              {/* Right half - gives X stars */}
              <span
                className="w-1/2 h-full hover:opacity-80 cursor-pointer"
                onClick={() => handleClick(starIndex, false)}
                title={`${starIndex} stars`}
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
