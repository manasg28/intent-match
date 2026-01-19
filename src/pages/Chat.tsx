import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserMatches } from '@/services/matchingService';
import { getCurrentUserProfile } from '@/services/discoveryService';
import { Match, UserProfile } from '@/types/user';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatView from '@/components/chat/ChatView';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');

  const [matches, setMatches] = useState<Match[]>([]);
  const [matchProfiles, setMatchProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const userMatches = await getUserMatches(user.uid);
        setMatches(userMatches);

        const profilePromises = userMatches.map(async (match) => {
          const otherUid = match.userA === user.uid ? match.userB : match.userA;
          const profile = await getCurrentUserProfile(otherUid);
          return { uid: otherUid, profile };
        });

        const profileResults = await Promise.all(profilePromises);
        const profilesMap: Record<string, UserProfile> = {};
        profileResults.forEach(({ uid, profile }) => {
          if (profile) {
            profilesMap[uid] = profile;
          }
        });

        setMatchProfiles(profilesMap);
      } catch (err) {
        console.error('Error loading matches:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (matchId) {
    const match = matches.find((m) => m.matchId === matchId);
    if (!match || !user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Match not found</h1>
            <Button onClick={() => navigate('/chat')} className="mt-4">
              Back to Matches
            </Button>
          </div>
        </div>
      );
    }

    const otherUid = match.userA === user.uid ? match.userB : match.userA;
    const otherProfile = matchProfiles[otherUid];

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chat')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">
                {otherProfile?.name || 'Loading...'}
              </h1>
              {otherProfile && (
                <p className="text-xs text-muted-foreground capitalize">
                  {otherProfile.intent}
                </p>
              )}
            </div>
          </div>
        </header>

        {otherProfile && (
          <ChatView match={match} otherProfile={otherProfile} />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground text-center">
          Matches
        </h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No matches yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Keep liking profiles to find your matches
            </p>
            <Button onClick={() => navigate('/discovery')}>
              Back to Discovery
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const otherUid = match.userA === user?.uid ? match.userB : match.userA;
              const otherProfile = matchProfiles[otherUid];

              if (!otherProfile) return null;

              return (
                <button
                  key={match.matchId}
                  onClick={() => navigate(`/chat?match=${match.matchId}`)}
                  className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold text-foreground">
                        {otherProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {otherProfile.name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize truncate">
                        {otherProfile.intent}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
