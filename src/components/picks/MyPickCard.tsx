import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface MyPickCardProps {
  pick: Pick;
  category?: Category;
  onEdit?: () => void;
}

/**
 * Staff-facing pick card for My picks list.
 * Shows: product name, brand, rating, tags.
 * Tap to edit.
 */
export function MyPickCard({ pick, category, onEdit }: MyPickCardProps) {
  return (
    <button
      onClick={onEdit}
      className="w-full text-left p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Product name and brand */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {pick.product_name}
            </h3>
            {!pick.is_active && (
              <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                Inactive
              </Badge>
            )}
          </div>
          
          {pick.brand && (
            <p className="text-sm text-muted-foreground truncate">{pick.brand}</p>
          )}

          {/* Tags */}
          {pick.effect_tags && pick.effect_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {pick.effect_tags.slice(0, 4).map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs bg-muted text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
              {pick.effect_tags.length > 4 && (
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                  +{pick.effect_tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Category badge (optional) */}
          {category && (
            <Badge variant="outline" className="text-xs mt-1">
              {category.name}
            </Badge>
          )}
        </div>

        {/* Star rating */}
        <div className="shrink-0">
          <StarRating value={pick.rating} size={14} showEmpty={false} />
        </div>
      </div>
    </button>
  );
}

export default MyPickCard;

