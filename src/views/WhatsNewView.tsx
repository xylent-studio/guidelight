import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestRelease, type Release } from '@/lib/api/releases';
import { updateLastSeenRelease } from '@/lib/api/userPreferences';

export function WhatsNewView() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const latest = await getLatestRelease();
      setRelease(latest);
      
      // Mark as seen
      if (profile?.id && latest) {
        await updateLastSeenRelease(profile.id, latest.id);
      }
      
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        title="What's new"
        showBackButton
        onBack={() => { navigate(-1); }}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : release ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  v{release.version}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(release.created_at).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="mt-2">{release.title}</CardTitle>
              {release.summary && (
                <CardDescription>{release.summary}</CardDescription>
              )}
            </CardHeader>
            {release.details_md && (
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {/* Simple markdown-ish rendering */}
                  {release.details_md.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(3)}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-base font-medium mt-3 mb-1">{line.slice(4)}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4 text-sm text-muted-foreground">{line.slice(2)}</li>;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-sm text-muted-foreground">{line}</p>;
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        ) : (
          <p className="text-muted-foreground text-center py-12">
            No release notes available yet.
          </p>
        )}
      </main>
    </div>
  );
}
