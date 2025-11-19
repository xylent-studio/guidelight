import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBudtenders, updateBudtender } from '@/lib/api/budtenders';
import type { Database } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InviteStaffForm } from '@/components/staff-management/InviteStaffForm';
import { EditStaffForm } from '@/components/staff-management/EditStaffForm';
import { DeleteStaffDialog } from '@/components/staff-management/DeleteStaffDialog';

type Budtender = Database['public']['Tables']['budtenders']['Row'];
type FilterMode = 'all' | 'active' | 'inactive';

export function StaffManagementView() {
  const { isManager, profile } = useAuth();
  const [staff, setStaff] = useState<Budtender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Budtender | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Budtender | null>(null);

  // Redirect if not a manager (defense in depth - route guard should handle this)
  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-text text-lg">⚠️ Manager access required</p>
        <p className="text-text-muted text-sm">
          Only managers can access Staff Management. Please contact your manager if you need access.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    setError(null);

    try {
      const allStaff = await getBudtenders();
      setStaff(allStaff);
    } catch (err: any) {
      console.error('Failed to load staff:', err);
      setError(err.message || 'Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(member: Budtender) {
    try {
      await updateBudtender(member.id, {
        is_active: !member.is_active,
      });

      // Update local state optimistically
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle active status:', err);
      alert(`Failed to update ${member.name}: ${err.message}`);
      // Reload to get correct state
      loadStaff();
    }
  }

  // Filter staff based on current filter mode
  const filteredStaff = staff.filter((s) => {
    if (filter === 'active') return s.is_active;
    if (filter === 'inactive') return !s.is_active;
    return true; // 'all'
  });

  // Count stats
  const activeCount = staff.filter((s) => s.is_active).length;
  const inactiveCount = staff.filter((s) => !s.is_active).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-text-muted">Loading staff...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-600 text-lg">⚠️ {error}</p>
        <Button onClick={loadStaff}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">Staff Management</h2>
          <p className="text-text-muted">
            Manage staff profiles, invite new team members, and control access.
          </p>
        </div>
        <Button size="lg" className="shrink-0" onClick={() => setShowInviteForm(true)}>
          + Invite Staff
        </Button>
      </div>

      {/* Modals */}
      <InviteStaffForm
        open={showInviteForm}
        onOpenChange={setShowInviteForm}
        onSuccess={loadStaff}
      />

      <EditStaffForm
        open={!!editingStaff}
        onOpenChange={(open) => !open && setEditingStaff(null)}
        onSuccess={loadStaff}
        staff={editingStaff}
      />

      <DeleteStaffDialog
        open={!!deletingStaff}
        onOpenChange={(open) => !open && setDeletingStaff(null)}
        onSuccess={loadStaff}
        staff={deletingStaff}
      />

      {/* Stats */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text">{staff.length}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-muted">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
        <TabsList>
          <TabsTrigger value="all">All ({staff.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-muted">
              {filter === 'active' && 'No active staff members.'}
              {filter === 'inactive' && 'No inactive staff members.'}
              {filter === 'all' && 'No staff members yet. Invite your first team member!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <Card
              key={member.id}
              className={`relative ${!member.is_active ? 'opacity-60' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 flex items-center gap-2">
                      {member.name}
                      {member.id === profile?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="capitalize text-sm">
                      {member.role.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Active Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <Label htmlFor={`active-${member.id}`} className="text-sm cursor-pointer">
                    Active Status
                  </Label>
                  <Switch
                    id={`active-${member.id}`}
                    checked={member.is_active}
                    onCheckedChange={() => handleToggleActive(member)}
                  />
                </div>

                {member.archetype && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Archetype</p>
                    <p className="text-sm text-text">{member.archetype}</p>
                  </div>
                )}
                {member.ideal_high && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Ideal High</p>
                    <p className="text-sm text-text line-clamp-2">{member.ideal_high}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingStaff(member)}
                  >
                    Edit
                  </Button>
                  {member.id !== profile?.id ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeletingStaff(member)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled
                      title="You cannot delete yourself"
                    >
                      Delete (Self)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default StaffManagementView;

