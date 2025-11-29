import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, type UserPreferences } from '@/lib/api/userPreferences';
import { getBoardById, type Board } from '@/lib/api/boards';

export function PreferencesView() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [lastBoard, setLastBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      const data = await getUserPreferences(profile.id);
      setPrefs(data);
      
      // Load board name if we have a last_board_id
      if (data?.last_board_id) {
        const board = await getBoardById(data.last_board_id);
        setLastBoard(board);
      }
      
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        title="Preferences"
        showBackButton
        onBack={() => { navigate(-1); }}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
                <CardDescription>
                  These are automatically saved as you use the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Last visited route</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Where you'll be taken when resuming
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {prefs?.last_route || 'Not set'}
                  </p>
                </div>
                
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Default board</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Shown when opening Display Mode
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lastBoard?.name || 'House list (default)'}
                  </p>
                </div>
                
                <div className="flex justify-between items-start py-2">
                  <div>
                    <p className="text-sm font-medium">Last updated</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When preferences were last saved
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prefs?.updated_at 
                      ? new Date(prefs.updated_at).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile?.name || 'Unknown'}
                  </p>
                </div>
                
                <div className="flex justify-between items-start py-2">
                  <div>
                    <p className="text-sm font-medium">Role</p>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile?.role || 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
