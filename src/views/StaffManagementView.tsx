import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateBudtender } from '@/lib/api/budtenders';
import { 
  getStaffWithStatus, 
  resetStaffPassword, 
  getStatusDisplay, 
  formatInviteDate,
  type StaffWithStatus 
} from '@/lib/api/staff-management';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserPlus, Pencil, Trash2, RotateCcw, Send, Users } from 'lucide-react';
import { InviteStaffForm } from '@/components/staff-management/InviteStaffForm';
import { EditStaffForm } from '@/components/staff-management/EditStaffForm';
import { DeleteStaffDialog } from '@/components/staff-management/DeleteStaffDialog';

type FilterMode = 'all' | 'active' | 'inactive' | 'pending';

export function StaffManagementView() {
  const { isManager, profile } = useAuth();
  const [staff, setStaff] = useState<StaffWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffWithStatus | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffWithStatus | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);

  // Load staff on mount - must be before any conditional returns!
  useEffect(() => {
    // Only load if user is a manager
    if (isManager) {
      loadStaff();
    }
  }, [isManager]);

  async function loadStaff() {
    setLoading(true);
    setError(null);

    try {
      const allStaff = await getStaffWithStatus();
      setStaff(allStaff);
    } catch (err: unknown) {
      console.error('Failed to load staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Redirect if not a manager (defense in depth - route guard should handle this)
  // This MUST come AFTER all hooks!
  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-text text-lg">Manager access required</p>
        <p className="text-text-muted text-sm">
          Only managers can access Staff Management. Please contact your manager if you need access.
        </p>
      </div>
    );
  }

  async function handleToggleActive(member: StaffWithStatus) {
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
    } catch (err: unknown) {
      console.error('Failed to toggle active status:', err);
      alert(`Failed to update ${member.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Reload to get correct state
      loadStaff();
    }
  }

  async function handleResetPassword(member: StaffWithStatus) {
    if (resettingPassword) return; // Prevent double-clicks
    
    setResettingPassword(member.id);
    
    try {
      const result = await resetStaffPassword(member.id);
      alert(result.message || `Password reset link sent to ${member.email}`);
    } catch (err: unknown) {
      console.error('Failed to reset password:', err);
      alert(`Failed to send reset link: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setResettingPassword(null);
    }
  }

  async function handleResendInvite(member: StaffWithStatus) {
    // For now, resending invite is handled by editing and re-inviting
    // In the future, we could add a dedicated resend endpoint
    setEditingStaff(member);
  }

  // Filter staff based on current filter mode
  const filteredStaff = staff.filter((s) => {
    if (filter === 'active') return s.is_active && s.invite_status === 'active';
    if (filter === 'inactive') return !s.is_active;
    if (filter === 'pending') return s.invite_status === 'pending';
    return true; // 'all'
  });

  // Count stats
  const activeCount = staff.filter((s) => s.is_active && s.invite_status === 'active').length;
  const inactiveCount = staff.filter((s) => !s.is_active).length;
  const pendingCount = staff.filter((s) => s.invite_status === 'pending').length;

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
        <p className="text-red-600 text-lg">{error}</p>
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
            Your team at a glance. Invite new people, tweak profiles, or adjust access.
          </p>
        </div>
        <Button size="lg" className="shrink-0" onClick={() => setShowInviteForm(true)}>
          <UserPlus size={18} className="mr-2" />
          Invite Staff
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Invite Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
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
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users size={40} className="mx-auto mb-4 text-text-muted/40" />
            <p className="text-text-muted">
              {filter === 'active' && 'No active staff members yet.'}
              {filter === 'inactive' && 'No one\'s on the bench — everyone\'s active!'}
              {filter === 'pending' && 'No pending invites. Everyone\'s signed in.'}
              {filter === 'all' && 'No staff members yet. Invite your first team member to get started!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => {
            const statusDisplay = getStatusDisplay(member.invite_status);
            const isCurrentUser = member.id === profile?.id;
            
            return (
              <Card
                key={member.id}
                className={`relative ${!member.is_active ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{member.name}</span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            You
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="capitalize text-sm">
                        {member.role.replace('_', ' ')}
                        {member.location && ` · ${member.location}`}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={statusDisplay.variant}
                      className={member.invite_status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                    >
                      {statusDisplay.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Email */}
                  {member.email && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Email</p>
                      <p className="text-sm text-text truncate">{member.email}</p>
                    </div>
                  )}

                  {/* Invite sent timestamp for pending */}
                  {member.invite_status === 'pending' && member.invited_at && (
                    <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Invite sent {formatInviteDate(member.invited_at)}
                    </div>
                  )}

                  {/* Last sign in for active users */}
                  {member.invite_status === 'active' && member.last_sign_in_at && (
                    <div className="text-xs text-text-muted">
                      Last sign in: {formatInviteDate(member.last_sign_in_at)}
                    </div>
                  )}

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <Label htmlFor={`active-${member.id}`} className="text-sm cursor-pointer">
                      Active Status
                    </Label>
                    <Switch
                      id={`active-${member.id}`}
                      checked={member.is_active}
                      onCheckedChange={() => handleToggleActive(member)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingStaff(member)}
                    >
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>

                    {/* Status-specific actions */}
                    {member.invite_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvite(member)}
                      >
                        <Send size={14} className="mr-1" />
                        Resend
                      </Button>
                    )}

                    {member.invite_status === 'active' && !isCurrentUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(member)}
                        disabled={resettingPassword === member.id}
                      >
                        <RotateCcw size={14} className={`mr-1 ${resettingPassword === member.id ? 'animate-spin' : ''}`} />
                        {resettingPassword === member.id ? 'Sending...' : 'Reset PW'}
                      </Button>
                    )}

                    {!isCurrentUser && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingStaff(member)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StaffManagementView;
