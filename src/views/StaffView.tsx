import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getActiveBudtenders, updateBudtender } from '@/lib/api/budtenders';
import { getCategories } from '@/lib/api/categories';
import { getPicksForBudtender, createPick, updatePick } from '@/lib/api/picks';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/types/database';

type Budtender = Database['public']['Tables']['budtenders']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Pick = Database['public']['Tables']['picks']['Row'];
type PickInsert = Database['public']['Tables']['picks']['Insert'];

type FormMode = 'closed' | 'add' | 'edit';

// Tolerance band definitions
const TOLERANCE_BANDS = [
  {
    id: 'light',
    label: 'Light rider',
    description: 'You feel things easily and prefer gentle, controlled highs.',
    example: 'Light rider — one hit or a low-dose gummy and I\'m feeling it.',
  },
  {
    id: 'steady',
    label: 'Steady flyer',
    description: 'You use pretty often but don\'t always need the strongest stuff.',
    example: 'Steady flyer — I use most days, but regular-strength products still work well for me.',
  },
  {
    id: 'heavy',
    label: 'Heavy hitter',
    description: 'You go through a lot and need stronger options to feel it.',
    example: 'Heavy hitter — I smoke every day and usually go for strong indicas or infused options.',
  },
] as const;

// Example expertise phrases
const EXPERTISE_EXAMPLES = [
  'Edibles for sleep & anxiety',
  'Budget pre-rolls that still hit',
  'Live resin vapes & terp-heavy carts',
  'Beginner-friendly flower and low-dose gummies',
  'Heavy indicas and "knockout" night options',
  'Social sativas and talkative highs',
  'CBD/ratio products for pain and tension',
  'Concentrates and dabs for experienced smokers',
];

// Example vibe phrases
const VIBE_EXAMPLES = [
  'Upstate hiker and home cook who loves bright, talkative sativas for daytime and cozy, heavy indicas for movie nights.',
  'Albany born and raised, dog dad, and live-resin nerd. I chase loud terps, smooth highs, and good playlists.',
  'Former barista turned budtender. I\'m all about balanced hybrids, chill social highs, and anything that pairs well with coffee and conversation.',
  'Gamer, gym rat, and dab dragon. I like heavy hitters after long days and functional vapes when I still need to get things done.',
];

export function StaffView() {
  const { profile: currentUserProfile, isManager } = useAuth();
  
  const [budtenders, setBudtenders] = useState<Budtender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [selectedBudtender, setSelectedBudtender] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>('closed');
  const [editingPick, setEditingPick] = useState<Pick | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PickInsert>>({});

  // Profile editing state
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileVibe, setProfileVibe] = useState('');
  const [profileExpertise, setProfileExpertise] = useState('');
  const [profileTolerance, setProfileTolerance] = useState('');
  const [selectedToleranceBand, setSelectedToleranceBand] = useState<string | null>(null);
  const [showVibeExamples, setShowVibeExamples] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = currentUserProfile?.id === selectedBudtender;
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

        // Auto-select current user's profile
        if (currentUserProfile && budtendersData.some(b => b.id === currentUserProfile.id)) {
          setSelectedBudtender(currentUserProfile.id);
        } else if (budtendersData.length > 0) {
          setSelectedBudtender(budtendersData[0].id);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [currentUserProfile]);

  // Load picks when budtender changes
  useEffect(() => {
    async function loadPicks() {
      if (!selectedBudtender) {
        setPicks([]);
        return;
      }

      try {
        const picksData = await getPicksForBudtender(selectedBudtender);
        setPicks(picksData);
      } catch (err) {
        console.error('Error loading picks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load picks');
      }
    }

    loadPicks();
  }, [selectedBudtender]);

  // Sync profile fields when selected budtender changes
  useEffect(() => {
    if (selectedBudtenderData) {
      setProfileVibe(selectedBudtenderData.profile_vibe || '');
      setProfileExpertise(selectedBudtenderData.profile_expertise || '');
      setProfileTolerance(selectedBudtenderData.profile_tolerance || '');
      setSelectedToleranceBand(null);
      setProfileEditing(false);
    }
  }, [selectedBudtenderData]);

  const handleAddPick = (categoryId: string) => {
    setFormMode('add');
    setEditingPick(null);
    setFormData({
      budtender_id: selectedBudtender,
      category_id: categoryId,
      product_name: '',
      product_type: 'flower',
      time_of_day: 'Anytime',
      rank: 1,
      is_active: true,
    });
  };

  const handleEditPick = (pick: Pick) => {
    setFormMode('edit');
    setEditingPick(pick);
    setFormData({
      product_name: pick.product_name,
      brand: pick.brand,
      category_id: pick.category_id,
      product_type: pick.product_type,
      pre_roll_subtype: pick.pre_roll_subtype,
      time_of_day: pick.time_of_day,
      effect_tags: pick.effect_tags,
      experience_level: pick.experience_level,
      budget_level: pick.budget_level,
      special_role: pick.special_role,
      why_i_love_it: pick.why_i_love_it,
      rank: pick.rank,
      is_active: pick.is_active,
    });
  };

  const handleCancelForm = () => {
    setFormMode('closed');
    setEditingPick(null);
    setFormData({});
  };

  const handleSaveForm = async () => {
    try {
      if (formMode === 'add') {
        await createPick(formData as PickInsert);
      } else if (formMode === 'edit' && editingPick) {
        await updatePick(editingPick.id, formData);
      }

      // Reload picks
      const picksData = await getPicksForBudtender(selectedBudtender);
      setPicks(picksData);

      handleCancelForm();
    } catch (err) {
      console.error('Error saving pick:', err);
      alert(err instanceof Error ? err.message : 'Failed to save pick');
    }
  };

  const handleToggleActive = async (pickId: string, currentActive: boolean) => {
    try {
      await updatePick(pickId, { is_active: !currentActive });
      const picksData = await getPicksForBudtender(selectedBudtender);
      setPicks(picksData);
    } catch (err) {
      console.error('Error toggling active:', err);
      alert(err instanceof Error ? err.message : 'Failed to update pick');
    }
  };

  const handleToleranceBandSelect = (bandId: string) => {
    const band = TOLERANCE_BANDS.find(b => b.id === bandId);
    if (band) {
      setSelectedToleranceBand(bandId);
      setProfileTolerance(band.example);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedBudtender) return;
    
    setProfileSaving(true);
    try {
      await updateBudtender(selectedBudtender, {
        profile_vibe: profileVibe.trim() || null,
        profile_expertise: profileExpertise.trim() || null,
        profile_tolerance: profileTolerance.trim() || null,
      });

      // Update local state
      setBudtenders(prev => prev.map(b => 
        b.id === selectedBudtender 
          ? { 
              ...b, 
              profile_vibe: profileVibe.trim() || null,
              profile_expertise: profileExpertise.trim() || null,
              profile_tolerance: profileTolerance.trim() || null,
            } 
          : b
      ));

      setProfileEditing(false);
      alert('Profile saved!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelProfileEdit = () => {
    if (selectedBudtenderData) {
      setProfileVibe(selectedBudtenderData.profile_vibe || '');
      setProfileExpertise(selectedBudtenderData.profile_expertise || '');
      setProfileTolerance(selectedBudtenderData.profile_tolerance || '');
    }
    setSelectedToleranceBand(null);
    setProfileEditing(false);
  };

  // Check if user can edit the selected profile
  const canEditProfile = isOwnProfile || isManager;

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Budtender Selector */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-xl text-text">Select Budtender</CardTitle>
          <CardDescription>Choose which staff member's profile and picks to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBudtender} onValueChange={setSelectedBudtender}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select a budtender" />
            </SelectTrigger>
            <SelectContent>
              {budtenders.map((budtender) => (
                <SelectItem key={budtender.id} value={budtender.id}>
                  {budtender.name} {budtender.id === currentUserProfile?.id && '(You)'} ({budtender.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* My Profile Section */}
      {selectedBudtender && canEditProfile && (
        <Card className="bg-surface border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl text-text">
                {isOwnProfile ? 'My Profile' : `${selectedBudtenderData?.name}'s Profile`}
              </CardTitle>
              <CardDescription>
                {isOwnProfile 
                  ? 'Tell customers who you are and what you\'re best at'
                  : 'Edit this staff member\'s profile information'
                }
              </CardDescription>
            </div>
            {!profileEditing ? (
              <Button onClick={() => setProfileEditing(true)} variant="outline" size="sm">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancelProfileEdit} variant="outline" size="sm" disabled={profileSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} size="sm" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {!profileEditing ? (
              // Read-only view
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">My vibe</p>
                  <p className="text-text">
                    {selectedBudtenderData?.profile_vibe || (
                      <span className="text-text-muted italic">Not set yet</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Expertise</p>
                  <p className="text-text">
                    {selectedBudtenderData?.profile_expertise || (
                      <span className="text-text-muted italic">Not set yet</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Tolerance</p>
                  <p className="text-text">
                    {selectedBudtenderData?.profile_tolerance || (
                      <span className="text-text-muted italic">Not set yet</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              // Edit mode
              <div className="space-y-6">
                {/* My vibe (profile_vibe) */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="profileVibe">My vibe</Label>
                    <p className="text-xs text-text-muted mt-1">
                      A couple short lines about you and how you like to live &amp; light up. Mix real life (hometown, hobbies, pets) with how you sesh and the vibes you love.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-bg-soft border border-border rounded-md text-xs text-text-muted space-y-2">
                    <p className="font-medium text-text">Try one of these patterns (1–3 sentences is perfect):</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>"I'm a [hometown] [role/hobby] who loves [product type] for [kind of night]."</li>
                      <li>"When I'm not at SOM, I'm usually [hobby], and my go-tos are [product] for [situation]."</li>
                      <li>"I'm the friend who always brings [product type] for [vibe], especially when [detail]."</li>
                    </ul>
                  </div>

                  <Textarea
                    id="profileVibe"
                    placeholder="Albany born and raised, dog dad, and live-resin nerd. I chase loud terps, smooth highs, and good playlists."
                    value={profileVibe}
                    onChange={(e) => setProfileVibe(e.target.value)}
                    disabled={profileSaving}
                    rows={3}
                    className="resize-none bg-bg"
                  />

                  <button
                    type="button"
                    onClick={() => setShowVibeExamples(!showVibeExamples)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showVibeExamples ? 'Hide example vibes' : 'Show example vibes'}
                  </button>

                  {showVibeExamples && (
                    <div className="p-3 bg-primary-soft/30 border border-primary/20 rounded-md text-xs space-y-2">
                      {VIBE_EXAMPLES.map((example, idx) => (
                        <p key={idx} className="text-text-muted italic">"{example}"</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expertise (profile_expertise) */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="profileExpertise">Expertise</Label>
                    <p className="text-xs text-text-muted mt-1">
                      What are you best at helping people with? Think product types, effects, or goals where you're the go-to person.
                    </p>
                  </div>

                  <Input
                    id="profileExpertise"
                    type="text"
                    placeholder="Edibles for sleep & anxiety"
                    value={profileExpertise}
                    onChange={(e) => setProfileExpertise(e.target.value)}
                    disabled={profileSaving}
                    className="bg-bg"
                  />

                  <div className="flex flex-wrap gap-1.5">
                    {EXPERTISE_EXAMPLES.map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileExpertise(example)}
                        className="px-2 py-1 text-xs bg-bg-soft border border-border rounded hover:border-primary hover:bg-primary-soft/20 transition-colors"
                        disabled={profileSaving}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tolerance (profile_tolerance) */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="profileTolerance">Tolerance</Label>
                    <p className="text-xs text-text-muted mt-1">
                      How much you usually use and how strong you like things. Be honest — this helps customers understand how your picks compare to their level.
                    </p>
                  </div>

                  {/* Tolerance band cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {TOLERANCE_BANDS.map((band) => (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => handleToleranceBandSelect(band.id)}
                        disabled={profileSaving}
                        className={`p-3 text-left border rounded-lg transition-all ${
                          selectedToleranceBand === band.id
                            ? 'border-primary bg-primary-soft/30 ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 hover:bg-bg-soft'
                        }`}
                      >
                        <p className="font-medium text-sm text-text">{band.label}</p>
                        <p className="text-xs text-text-muted mt-1">{band.description}</p>
                      </button>
                    ))}
                  </div>

                  <Input
                    id="profileTolerance"
                    type="text"
                    placeholder="Steady flyer — I use most days, but regular-strength products still work well for me."
                    value={profileTolerance}
                    onChange={(e) => {
                      setProfileTolerance(e.target.value);
                      setSelectedToleranceBand(null);
                    }}
                    disabled={profileSaving}
                    className="bg-bg"
                  />
                  <p className="text-xs text-text-muted">
                    Select a band above to get started, then edit the text to make it your own.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Picks by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryPicks = picks.filter((pick) => pick.category_id === category.id);

          return (
            <Card key={category.id} className="bg-surface border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg text-text">{category.name}</CardTitle>
                  <CardDescription>
                    {categoryPicks.length} pick{categoryPicks.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                {(isOwnProfile || isManager) && (
                  <Button onClick={() => handleAddPick(category.id)} variant="default" size="sm">
                    + Add Pick
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryPicks.length === 0 ? (
                  <p className="text-sm text-text-muted italic">
                    No picks yet. Add one to get started.
                  </p>
                ) : (
                  categoryPicks.map((pick) => (
                    <div
                      key={pick.id}
                      className="flex items-center justify-between p-4 bg-bg-soft border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text">{pick.product_name}</h4>
                          {pick.special_role && (
                            <Badge variant="outline" className="text-xs">
                              {pick.special_role.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {!pick.is_active && (
                            <Badge variant="outline" className="text-xs text-text-muted">
                              inactive
                            </Badge>
                          )}
                        </div>
                        {pick.brand && <p className="text-sm text-text-muted">{pick.brand}</p>}
                      </div>
                      {(isOwnProfile || isManager) && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${pick.id}`} className="text-sm text-text-muted">
                              Active
                            </Label>
                            <Switch
                              id={`active-${pick.id}`}
                              checked={pick.is_active}
                              onCheckedChange={() => handleToggleActive(pick.id, pick.is_active)}
                            />
                          </div>
                          <Button onClick={() => handleEditPick(pick)} variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Pick Form */}
      {formMode !== 'closed' && (
        <Card className="bg-surface border-border border-primary">
          <CardHeader>
            <CardTitle className="text-xl text-text">
              {formMode === 'add' ? 'Add New Pick' : 'Edit Pick'}
            </CardTitle>
            <CardDescription>Fill out the details for this pick.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  value={formData.product_name || ''}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g., Blue Dream"
                  className="bg-bg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Pacific Stone"
                  className="bg-bg"
                />
              </div>
            </div>

            {/* Product Type & Time of Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-type">Product Type *</Label>
                <Select
                  value={formData.product_type || 'flower'}
                  onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                >
                  <SelectTrigger id="product-type" className="bg-bg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flower">Flower</SelectItem>
                    <SelectItem value="pre_roll">Pre-roll</SelectItem>
                    <SelectItem value="vape">Vape</SelectItem>
                    <SelectItem value="edible">Edible</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="concentrate">Concentrate</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-of-day">Time of Day</Label>
                <Select
                  value={formData.time_of_day || 'Anytime'}
                  onValueChange={(value) => setFormData({ ...formData, time_of_day: value })}
                >
                  <SelectTrigger id="time-of-day" className="bg-bg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                    <SelectItem value="Anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Why I Love It */}
            <div className="space-y-2">
              <Label htmlFor="why-i-love-it">Why I Love It</Label>
              <Textarea
                id="why-i-love-it"
                value={formData.why_i_love_it || ''}
                onChange={(e) => setFormData({ ...formData, why_i_love_it: e.target.value })}
                placeholder="Share your personal take on this product..."
                rows={3}
                className="bg-bg resize-none"
              />
            </div>

            {/* Rank */}
            <div className="space-y-2">
              <Label htmlFor="rank">Rank (Sort Order)</Label>
              <Input
                id="rank"
                type="number"
                min="1"
                max="10"
                value={formData.rank || 1}
                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                className="bg-bg w-32"
              />
              <p className="text-xs text-text-muted">
                Lower numbers appear first within the category.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Switch
                  id="form-active"
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="form-active" className="text-sm text-text-muted">
                  Active (visible to customers)
                </Label>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCancelForm} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSaveForm} variant="default">
                  {formMode === 'add' ? 'Add Pick' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StaffView;
