import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileErrorScreenProps {
  message: string;
}

/**
 * Shown when a user is authenticated but their budtender profile
 * cannot be loaded (e.g., not set up, database error, etc.)
 */
export function ProfileErrorScreen({ message }: ProfileErrorScreenProps) {
  const { signOut, refreshProfile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleRetry = async () => {
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
          <CardTitle className="text-xl text-zinc-100">
            Account Setup Required
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-500 text-center">
            If you believe this is an error, try refreshing or contact your manager
            to ensure your staff profile has been created.
          </p>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full border-zinc-700 hover:bg-zinc-800"
            >
              Try Again
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full text-zinc-400 hover:text-zinc-100"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

