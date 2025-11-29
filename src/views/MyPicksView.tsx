import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { CategoryChipsRow } from '@/components/ui/CategoryChipsRow';
import { MyPickCard } from '@/components/picks/MyPickCard';
import { ShowToCustomerOverlay } from '@/components/picks/ShowToCustomerOverlay';
import { PickFormModal, DraftCard } from '@/components/picks';
import { FeedbackButton } from '@/components/feedback';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/lib/api/categories';
import { getPicksForBudtender } from '@/lib/api/picks';
import { getUserDrafts, deleteDraft, type PickDraftRow } from '@/lib/api/drafts';
import type { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type Pick = Database['public']['Tables']['picks']['Row'];

type FormMode = 'closed' | 'add' | 'edit';

/**
 * My picks - Staff home screen
 * Simplified view showing a flat list of picks with add/edit/show functionality.
 */
export function MyPicksView() {
  const navigate = useNavigate();
  const { profile, isManager, signOut } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [drafts, setDrafts] = useState<PickDraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Form state
  const [formMode, setFormMode] = useState<FormMode>('closed');
  const [editingPick, setEditingPick] = useState<Pick | null>(null);
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [resumingDraft, setResumingDraft] = useState<PickDraftRow | null>(null);

  // Show to customer overlay
  const [showCustomerOverlay, setShowCustomerOverlay] = useState(false);

  // Load drafts
  const loadDrafts = useCallback(async () => {
    if (!profile) return;
    const userDrafts = await getUserDrafts();
    setDrafts(userDrafts);
  }, [profile]);

  // Load data
  const loadData = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      const [categoriesData, picksData] = await Promise.all([
        getCategories(),
        getPicksForBudtender(profile.id),
      ]);

      setCategories(categoriesData);
      
      // Sort picks: active first, then by rating desc, then by updated_at desc
      const sortedPicks = [...picksData].sort((a, b) => {
        // Active picks first
        if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
        // Then by rating
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        // Then by updated_at
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setPicks(sortedPicks);
      
      // Also load drafts
      await loadDrafts();
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [profile, loadDrafts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter picks by selected category
  const filteredPicks = useMemo(() => {
    if (!selectedCategory) return picks;
    return picks.filter(pick => pick.category_id === selectedCategory);
  }, [picks, selectedCategory]);

  // Handlers
  const handleAddPick = () => {
    // Pre-select category if one is currently filtered
    setFormCategoryId(selectedCategory || '');
    setEditingPick(null);
    setFormMode('add');
  };

  const handleEditPick = (pick: Pick) => {
    setFormCategoryId(pick.category_id);
    setEditingPick(pick);
    setResumingDraft(null);
    setFormMode('edit');
  };

  // Resume editing a draft
  const handleResumeDraft = (draft: PickDraftRow) => {
    const draftData = draft.data as { category_id?: string } | null;
    setFormCategoryId(draftData?.category_id || '');
    setResumingDraft(draft);
    setEditingPick(null);
    // If draft has a pick_id, we're editing an existing pick
    setFormMode(draft.pick_id ? 'edit' : 'add');
  };

  // Delete a draft from the list
  const handleDeleteDraft = async (draftId: string) => {
    await deleteDraft(draftId);
    setDrafts(drafts.filter(d => d.id !== draftId));
    toast.success('Draft discarded');
  };

  const handleFormClose = () => {
    setFormMode('closed');
    setEditingPick(null);
    setResumingDraft(null);
    // Refresh drafts when modal closes
    loadDrafts();
  };

  const handleFormSuccess = async () => {
    await loadData();
    // Refresh drafts (draft should be deleted after publish)
    await loadDrafts();
    handleFormClose();
    toast.success(editingPick ? 'Pick updated!' : 'Pick published!');
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) return;
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out');
    }
  };

  // Build overflow menu
  const overflowMenu = [
    { label: 'Boards', onClick: () => navigate('/boards') },
    { label: 'Browse all picks', onClick: () => navigate('/display') },
    ...(isManager ? [{ label: 'Team', onClick: () => navigate('/team') }] : []),
    { label: 'Log out', onClick: handleLogout, destructive: true },
  ];

  // Get category for a pick (for display)
  const getCategoryForPick = (pick: Pick) => categories.find(c => c.id === pick.category_id);

  // Only show active picks for customer view
  const activePicks = picks.filter(p => p.is_active);

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
        <Button onClick={loadData} variant="outline">Try again</Button>
      </div>
    );
  }

  // Get selected category name for display
  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <HeaderBar
        title="My picks"
        avatar={profile ? { name: profile.name } : undefined}
        rightActions={<ProfileMenu />}
        overflowMenu={overflowMenu}
      />

      {/* Drafts section - shown when user has drafts */}
      {drafts.length > 0 && (
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              Drafts
            </h2>
            <div className="space-y-2">
              {drafts.map(draft => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onResume={() => handleResumeDraft(draft)}
                  onDelete={() => handleDeleteDraft(draft.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category filter chips */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-3">
        <CategoryChipsRow
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="max-w-2xl mx-auto"
        />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Empty state - no picks at all */}
        {picks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No picks yet</p>
            <Button onClick={handleAddPick} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add pick
            </Button>
          </div>
        ) : filteredPicks.length === 0 ? (
          /* Empty state - no picks in selected category */
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No {selectedCategoryName?.toLowerCase()} picks</p>
            <Button onClick={handleAddPick} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add pick
            </Button>
          </div>
        ) : (
          <>
            {/* Picks list */}
            <div className="space-y-3 mb-6">
              {filteredPicks.map(pick => (
                <MyPickCard
                  key={pick.id}
                  pick={pick}
                  category={getCategoryForPick(pick)}
                  onEdit={() => handleEditPick(pick)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Sticky bottom actions */}
      {picks.length > 0 && (
        <div className="sticky bottom-0 bg-background border-t border-border px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleAddPick}
            >
              <Plus className="h-4 w-4 mr-2" />
              {selectedCategoryName ? `Add ${selectedCategoryName}` : 'Add pick'}
            </Button>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => setShowCustomerOverlay(true)}
              disabled={activePicks.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Show to customer
            </Button>
          </div>
        </div>
      )}

      {/* Show to Customer Overlay */}
      <ShowToCustomerOverlay
        isOpen={showCustomerOverlay}
        onClose={() => setShowCustomerOverlay(false)}
        userName={profile?.name || 'Staff'}
        picks={activePicks}
        categories={categories}
      />

      {/* Add/Edit Pick Modal */}
      <PickFormModal
        open={formMode !== 'closed'}
        onOpenChange={(open) => !open && handleFormClose()}
        onSuccess={handleFormSuccess}
        mode={formMode === 'closed' ? 'add' : formMode}
        budtenderId={profile?.id || ''}
        categoryId={formCategoryId}
        categoryName={editingPick ? getCategoryForPick(editingPick)?.name || '' : categories.find(c => c.id === formCategoryId)?.name || ''}
        showCategorySelector={true}
        categories={categories}
        editingPick={editingPick}
        initialDraft={resumingDraft}
        onPublished={() => loadDrafts()}
      />

      {/* Floating feedback button */}
      <FeedbackButton pageContext="staff" />

      {/* Theme toggle in footer area */}
      <div className="fixed bottom-20 left-4 z-40">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default MyPicksView;

