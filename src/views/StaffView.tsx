import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getActiveBudtenders } from '@/lib/api/budtenders';
import { getCategories } from '@/lib/api/categories';
import { getPicksForBudtender, createPick, updatePick } from '@/lib/api/picks';
import type { Database } from '@/types/database';

type Budtender = Database['public']['Tables']['budtenders']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Pick = Database['public']['Tables']['picks']['Row'];
type PickInsert = Database['public']['Tables']['picks']['Insert'];

type FormMode = 'closed' | 'add' | 'edit';

export function StaffView() {
  const [budtenders, setBudtenders] = useState<Budtender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [selectedBudtender, setSelectedBudtender] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>('closed');
  const [editingPick, setEditingPick] = useState<Pick | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PickInsert>>({});

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

        // Auto-select first budtender
        if (budtendersData.length > 0) {
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
  }, []);

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
          <CardDescription>Choose which staff member's picks to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBudtender} onValueChange={setSelectedBudtender}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select a budtender" />
            </SelectTrigger>
            <SelectContent>
              {budtenders.map((budtender) => (
                <SelectItem key={budtender.id} value={budtender.id}>
                  {budtender.name} ({budtender.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
                <Button onClick={() => handleAddPick(category.id)} variant="default" size="sm">
                  + Add Pick
                </Button>
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
