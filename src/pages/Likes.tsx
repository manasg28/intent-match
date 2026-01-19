import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrentUserProfile } from '@/services/discoveryService';
import { Like, UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const Likes = () => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Like[]>([]);
  const [likeProfiles, setLikeProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikes = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('toUid', '==', user.uid)
        );

        const likesSnap = await getDocs(likesQuery);
        const userLikes: Like[] = [];

        likesSnap.forEach((doc) => {
          const data = doc.data();
          userLikes.push({
            fromUid: data.fromUid,
            toUid: data.toUid,
            targetType: data.targetType,
            targetId: data.targetId,
            comment: data.comment,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });

        setLikes(userLikes);

        const profilePromises = userLikes.map(async (like) => {
          const profile = await getCurrentUserProfile(like.fromUid);
          return { uid: like.fromUid, profile };
        });

        const profileResults = await Promise.all(profilePromises);
        const profilesMap: Record<string, UserProfile> = {};
        profileResults.forEach(({ uid, profile }) => {
          if (profile) {
            profilesMap[uid] = profile;
          }
        });

        setLikeProfiles(profilesMap);
      } catch (err) {
        console.error('Error loading likes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLikes();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground text-center">
          Likes
        </h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4">
        {likes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No likes yet
            </h2>
            <p className="text-muted-foreground">
              When someone likes you, they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              {likes.length} {likes.length === 1 ? 'person' : 'people'} liked you
            </p>
            {likes.map((like) => {
              const profile = likeProfiles[like.fromUid];

              if (!profile) return null;

              return (
                <div
                  key={`${like.fromUid}_${like.timestamp.getTime()}`}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold text-foreground">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {profile.intent}
                      </p>
                    </div>
                    <Heart className="h-5 w-5 text-destructive fill-destructive" />
                  </div>

                  <div className="rounded-lg bg-muted p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">
                      Liked your {like.targetType}
                    </p>
                    {like.comment && (
                      <p className="text-sm text-foreground">"{like.comment}"</p>
                    )}
                  </div>

                  <Button className="w-full" size="sm">
                    Like Back
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Likes;