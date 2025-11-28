import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Pencil, Trash2, RotateCcw, Send, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateBudtender } from '@/lib/api/budtenders';
import { 
  getStaffWithStatus, 
  resetStaffPassword, 
  getStatusDisplay, 
  formatInviteDate,
  type StaffWithStatus 
} from '@/lib/api/staff-management';
import { getNewFeedbackCount } from '@/lib/api/feedback';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { InviteStaffForm } from '@/components/staff-management/InviteStaffForm';
import { EditStaffForm } from '@/components/staff-management/EditStaffForm';
import { DeleteStaffDialog } from '@/components/staff-management/DeleteStaffDialog';
import { FeedbackList, FeedbackButton } from '@/components/feedback';
import { staffManagement, errors, feedback as feedbackCopy } from '@/lib/copy';

type FilterMode = 'all' | 'active' | 'inactive' | 'pending';
type ManagementTab = 'staff' | 'feedback';

export function StaffManagementView() {
  const { isManager, profile } = useAuth();
  const [managementTab, setManagementTab] = useState<ManagementTab>('staff');
  const [staff, setStaff] = useState<StaffWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffWithStatus | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffWithStatus | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);

  // Load staff and feedback count on mount - must be before any conditional returns!
  useEffect(() => {
    // Only load if user is a manager
    if (isManager) {
      loadStaff();
      loadFeedbackCount();
    }
  }, [isManager]);

  async function loadFeedbackCount() {
    try {
      const count = await getNewFeedbackCount();
      setNewFeedbackCount(count);
    } catch (err) {
      console.error('Failed to load feedback count:', err);
    }
  }

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
        <p className="text-foreground text-lg">Manager access required</p>
        <p className="text-muted-foreground text-sm">
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

  async function handleToggleCustomerView(member: StaffWithStatus) {
    try {
      await updateBudtender(member.id, {
        show_in_customer_view: !member.show_in_customer_view,
      });

      // Update local state optimistically
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id ? { ...s, show_in_customer_view: !s.show_in_customer_view } : s
        )
      );
    } catch (err: unknown) {
      console.error('Failed to toggle customer view visibility:', err);
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

  // Sort filtered staff with current user first (top-left position)
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (a.id === profile?.id) return -1;
    if (b.id === profile?.id) return 1;
    return 0; // maintain original order for others
  });

  // Count stats
  const activeCount = staff.filter((s) => s.is_active && s.invite_status === 'active').length;
  const inactiveCount = staff.filter((s) => !s.is_active).length;
  const pendingCount = staff.filter((s) => s.invite_status === 'pending').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground">Loading staff...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h3 className="text-lg font-semibold text-foreground">{errors.networkInline.heading}</h3>
        <p className="text-muted-foreground text-center max-w-md">{errors.networkInline.body}</p>
        <Button onClick={loadStaff} variant="outline">
          {errors.networkInline.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to My picks</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Team</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
      {/* Top-level Management Tabs */}
      <Tabs value={managementTab} onValueChange={(v) => setManagementTab(v as ManagementTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="staff" className="gap-2">
            <Users size={16} />
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageCircle size={16} />
            {feedbackCopy.management.tabLabel}
            {newFeedbackCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 text-xs">
                {newFeedbackCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Staff Tab Content */}
        <TabsContent value="staff" className="mt-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{staffManagement.heading}</h2>
              <p className="text-muted-foreground">
                {staffManagement.subtext}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{staffManagement.stats.totalStaff}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{staffManagement.stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{staffManagement.stats.invitesPending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{staffManagement.stats.inactive}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{inactiveCount}</div>
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
            <Users size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {filter === 'active' && staffManagement.empty.active}
              {filter === 'inactive' && staffManagement.empty.inactive}
              {filter === 'pending' && staffManagement.empty.pending}
              {filter === 'all' && staffManagement.empty.all}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStaff.map((member) => {
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
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm text-foreground truncate">{member.email}</p>
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
                    <div className="text-xs text-muted-foreground">
                      Last sign in: {formatInviteDate(member.last_sign_in_at)}
                    </div>
                  )}

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <Label htmlFor={`active-${member.id}`} className="text-sm cursor-pointer">
                      {staffManagement.card.canSignInLabel}
                    </Label>
                    <Switch
                      id={`active-${member.id}`}
                      checked={member.is_active}
                      onCheckedChange={() => handleToggleActive(member)}
                    />
                  </div>

                  {/* Show in Customer View Toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div>
                      <Label htmlFor={`customer-view-${member.id}`} className="text-sm cursor-pointer">
                        Show in Customer View
                      </Label>
                      <p className="text-xs text-muted-foreground">Hidden staff can still login and manage picks</p>
                    </div>
                    <Switch
                      id={`customer-view-${member.id}`}
                      checked={member.show_in_customer_view}
                      onCheckedChange={() => handleToggleCustomerView(member)}
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
                        title={staffManagement.card.removeTooltip}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </TabsContent>

        {/* Feedback Tab Content */}
        <TabsContent value="feedback" className="mt-0">
          <FeedbackList />
        </TabsContent>
      </Tabs>
      </div>

      {/* Floating feedback button */}
      <FeedbackButton pageContext="staff" />

      {/* Theme toggle */}
      <div className="fixed bottom-20 left-4 z-40">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default StaffManagementView;
