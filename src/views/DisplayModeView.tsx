import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CategoryChipsRow } from '@/components/ui/CategoryChipsRow';
import { GuestPickCard } from '@/components/picks/GuestPickCard';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveBudtenders } from '@/lib/api/budtenders';
import { getCategories } from '@/lib/api/categories';
import { getActivePicksForBudtender } from '@/lib/api/picks';
import type { Database } from '@/types/database';

type Budtender = Database['public']['Tables']['budtenders']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Pick = Database['public']['Tables']['picks']['Row'];

// Extended pick type with budtender info for house list
interface HouseListPick extends Pick {
  budtender_name?: string;
}

/**
 * Display Mode - Public view for POS/kiosk
 * Shows house list (top picks from all staff) by default
 * Works without authentication
 */
export function DisplayModeView() {
  const { user } = useAuth();
  const [budtenders, setBudtenders] = useState<Budtender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [picks, setPicks] = useState<HouseListPick[]>([]);
  const [selectedBudtender, setSelectedBudtender] = useState<string | null>(null); // null = house list
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStaffSelector, setShowStaffSelector] = useState(false);

  // Get selected budtender data
  const selectedBudtenderData = selectedBudtender 
    ? budtenders.find(b => b.id === selectedBudtender) 
    : null;

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [budtendersData, categoriesData] = await Promise.all([
        getActiveBudtenders(),
        getCategories(),
      ]);

      // Filter to visible budtenders
      const visibleBudtenders = budtendersData.filter(b => b.show_in_customer_view);
      setBudtenders(visibleBudtenders);
      setCategories(categoriesData);

      // Load house list (picks from all budtenders)
      await loadHouseList(visibleBudtenders);
    } catch (err) {
      console.error('Error loading display data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load house list - top picks from all budtenders
  async function loadHouseList(budtendersList: Budtender[]) {
    try {
      const allPicks: HouseListPick[] = [];
      
      // Fetch picks for each budtender
      for (const budtender of budtendersList) {
        const budtenderPicks = await getActivePicksForBudtender(budtender.id);
        // Add budtender name to each pick
        const picksWithName = budtenderPicks.map(pick => ({
          ...pick,
          budtender_name: budtender.name,
        }));
        allPicks.push(...picksWithName);
      }

      // Sort by rating (highest first), then by updated_at
      allPicks.sort((a, b) => {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      // Limit to top 12 picks for house list
      setPicks(allPicks.slice(0, 12));
    } catch (err) {
      console.error('Error loading house list:', err);
    }
  }

  // Load picks for a specific budtender
  async function loadBudtenderPicks(budtenderId: string) {
    try {
      const budtender = budtenders.find(b => b.id === budtenderId);
      const budtenderPicks = await getActivePicksForBudtender(budtenderId);
      const picksWithName = budtenderPicks.map(pick => ({
        ...pick,
        budtender_name: budtender?.name,
      }));
      setPicks(picksWithName);
    } catch (err) {
      console.error('Error loading budtender picks:', err);
    }
  }

  // Handle budtender selection
  function handleSelectBudtender(budtenderId: string | null) {
    setSelectedBudtender(budtenderId);
    setShowStaffSelector(false);
    
    if (budtenderId === null) {
      loadHouseList(budtenders);
    } else {
      loadBudtenderPicks(budtenderId);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Filter picks by category
  const filteredPicks = selectedCategory
    ? picks.filter(pick => pick.category_id === selectedCategory)
    : picks;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={loadInitialData} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (budtenders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No picks available</p>
        {!user && (
          <Link to="/login">
            <Button variant="outline" size="sm">Staff login</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {selectedBudtenderData ? `${selectedBudtenderData.name}'s picks` : 'House picks'}
            </h1>
            {!user && (
              <Badge variant="secondary" className="mt-1">Guest</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStaffSelector(!showStaffSelector)}
            >
              Change
            </Button>
            {user ? (
              <Link to="/">
                <Button variant="outline" size="sm">My picks</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Staff Selector Overlay */}
      {showStaffSelector && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowStaffSelector(false)}>
          <div 
            className="absolute top-16 right-4 w-80 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-lg shadow-lg p-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold text-foreground mb-3">View picks from:</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSelectBudtender(null)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedBudtender === null 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="font-medium">House picks</span>
                <span className="text-sm opacity-80 block">Top picks from all staff</span>
              </button>
              {budtenders.map(budtender => (
                <button
                  key={budtender.id}
                  onClick={() => handleSelectBudtender(budtender.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedBudtender === budtender.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{budtender.name}</span>
                  {budtender.profile_expertise && (
                    <span className="text-sm opacity-80 block">{budtender.profile_expertise}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budtender Profile (when viewing individual) */}
      {selectedBudtenderData && (
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                {selectedBudtenderData.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground text-lg">{selectedBudtenderData.name}</h2>
                {selectedBudtenderData.profile_expertise && (
                  <p className="text-sm text-muted-foreground">{selectedBudtenderData.profile_expertise}</p>
                )}
                {selectedBudtenderData.profile_vibe && (
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    "{selectedBudtenderData.profile_vibe}"
                  </p>
                )}
                {selectedBudtenderData.profile_tolerance && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Tolerance:</span> {selectedBudtenderData.profile_tolerance}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Chips */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <CategoryChipsRow
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Picks Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {filteredPicks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedCategory ? 'No picks in this category' : 'No picks available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPicks.map(pick => (
              <GuestPickCard 
                key={pick.id} 
                pick={pick} 
                budtenderName={!selectedBudtender ? pick.budtender_name : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer - minimal branding */}
      <footer className="border-t border-border py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground/60">Guidelight</span>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}

export default DisplayModeView;
