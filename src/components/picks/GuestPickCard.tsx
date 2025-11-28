import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];

interface GuestPickCardProps {
  pick: Pick;
  /** Budtender name to show (for house list mode) */
  budtenderName?: string;
  /** Show THC/CBD info if available (Phase 2+) */
  showLabInfo?: boolean;
}

/**
 * Customer-facing pick card for Display Mode and Show to Customer.
 * Shows: product name, brand, rating, tags, optional budtender name.
 * Read-only, no edit controls.
 */
export function GuestPickCard({ pick, budtenderName, showLabInfo = false }: GuestPickCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-foreground leading-tight">
              {pick.product_name}
            </CardTitle>
            {pick.brand && (
              <p className="text-sm text-muted-foreground mt-0.5">{pick.brand}</p>
            )}
          </div>
          <StarRating value={pick.rating} size={16} showEmpty={false} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Effect tags */}
        {pick.effect_tags && pick.effect_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pick.effect_tags.slice(0, 5).map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs bg-accent text-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Lab info (Phase 2+) */}
        {showLabInfo && (pick as unknown as { thc_percent?: number }).thc_percent && (
          <p className="text-xs text-muted-foreground">
            THC {(pick as unknown as { thc_percent: number }).thc_percent}%
            {(pick as unknown as { cbd_percent?: number }).cbd_percent && 
              ` · CBD ${(pick as unknown as { cbd_percent: number }).cbd_percent}%`}
          </p>
        )}

        {/* Why I love it (if present and short) */}
        {pick.why_i_love_it && pick.why_i_love_it.length < 100 && (
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "{pick.why_i_love_it}"
          </p>
        )}

        {/* Budtender attribution (for house list mode) */}
        {budtenderName && (
          <p className="text-xs text-muted-foreground pt-1">
            — {budtenderName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default GuestPickCard;

