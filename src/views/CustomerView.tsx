import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getActiveBudtenders } from '@/lib/api/budtenders';
import { getCategories } from '@/lib/api/categories';
import { getActivePicksForBudtender } from '@/lib/api/picks';
import type { Database } from '@/types/database';

type Budtender = Database['public']['Tables']['budtenders']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Pick = Database['public']['Tables']['picks']['Row'];

// Truncate text with ellipsis
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim() + '…';
}

export function CustomerView() {
  const [budtenders, setBudtenders] = useState<Budtender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [selectedBudtender, setSelectedBudtender] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the selected budtender's data
  const selectedBudtenderData = budtenders.find(b => b.id === selectedBudtender);

  // Load budtenders and categories on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [budtendersData, categoriesData] = await Promise.all([
          getActiveBudtenders(),
          getCategories(),
        ]);

        setBudtenders(budtendersData);
        setCategories(categoriesData);

        // Auto-select first budtender and category
        if (budtendersData.length > 0) {
          setSelectedBudtender(budtendersData[0].id);
        }
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Load picks when budtender selection changes
  useEffect(() => {
    async function loadPicks() {
      if (!selectedBudtender) {
        setPicks([]);
        return;
      }

      try {
        const picksData = await getActivePicksForBudtender(selectedBudtender);
        setPicks(picksData);
      } catch (err) {
        console.error('Error loading picks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load picks');
      }
    }

    loadPicks();
  }, [selectedBudtender]);

  // Filter picks by selected category
  const filteredPicks = picks.filter((pick) => pick.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (budtenders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">No active budtenders found. Add staff members to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Budtender Selector */}
      <section>
        <h2 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-3">
          Select Your Budtender
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {budtenders.map((budtender) => (
            <Button
              key={budtender.id}
              variant={selectedBudtender === budtender.id ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedBudtender(budtender.id)}
              className="flex flex-col items-start text-left h-auto py-4 px-5 gap-1 min-h-[72px]"
            >
              <span className="font-semibold text-base">{budtender.name}</span>
              {budtender.profile_expertise && (
                <span className="text-sm font-normal opacity-90 line-clamp-1">
                  {truncate(budtender.profile_expertise, 40)}
                </span>
              )}
            </Button>
          ))}
        </div>
      </section>

      {/* Profile Info Section */}
      {selectedBudtenderData && (selectedBudtenderData.profile_vibe || selectedBudtenderData.profile_tolerance) && (
        <section className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            {/* Avatar placeholder - could be enhanced later */}
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
              {selectedBudtenderData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-semibold text-text text-lg">{selectedBudtenderData.name}</h3>
              
              {/* My vibe */}
              {selectedBudtenderData.profile_vibe && (
                <p className="text-text-muted text-sm leading-relaxed">
                  {selectedBudtenderData.profile_vibe}
                </p>
              )}
              
              {/* Tolerance */}
              {selectedBudtenderData.profile_tolerance && (
                <div className="pt-1">
                  <p className="text-xs text-text-muted">
                    <span className="font-medium">Tolerance:</span>{' '}
                    {selectedBudtenderData.profile_tolerance}
                  </p>
                  {/* Hint for high tolerance */}
                  {(selectedBudtenderData.profile_tolerance.toLowerCase().includes('heavy') ||
                    selectedBudtenderData.profile_tolerance.toLowerCase().includes('high') ||
                    selectedBudtenderData.profile_tolerance.toLowerCase().includes('dab') ||
                    selectedBudtenderData.profile_tolerance.toLowerCase().includes('blunt')) && (
                    <p className="text-xs text-text-muted/70 italic mt-1">
                      If you're newer, start a bit lower than what they'd personally use.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory || undefined}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Pick Cards Grid */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            {filteredPicks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted">
                  No picks yet for {category.name}. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredPicks.slice(0, 6).map((pick) => (
                  <Card
                    key={pick.id}
                    className="bg-surface border-border hover:border-primary transition-colors"
                  >
                    <CardHeader>
                      <CardTitle className="text-xl text-text">{pick.product_name}</CardTitle>
                      {pick.brand && <p className="text-sm text-text-muted">{pick.brand}</p>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Effect Tags */}
                      {pick.effect_tags && pick.effect_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pick.effect_tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-primary-soft text-text text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Time of Day Badge */}
                      <div>
                        <Badge variant="outline" className="border-border text-text-muted text-xs">
                          {pick.time_of_day}
                        </Badge>
                      </div>

                      {/* Why I Love It */}
                      {pick.why_i_love_it && (
                        <p className="text-sm text-text-muted italic leading-relaxed">
                          "{pick.why_i_love_it}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Desktop POS Note */}
            <div className="mt-6 p-4 bg-bg-soft border border-border rounded-lg">
              <p className="text-xs text-text-muted">
                <strong>POS Mode:</strong> On desktop displays (1920×1080), this layout shows up
                to 6 cards per category. On tablets and phones, the layout is fully responsive and
                scrollable.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default CustomerView;
