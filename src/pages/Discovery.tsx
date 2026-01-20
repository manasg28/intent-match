import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscovery } from '@/hooks/useDiscovery';
import ProfileCard from '@/components/discovery/ProfileCard';
import LikeSelector from '@/components/discovery/LikeSelector';
import DiscoveryEmpty from '@/components/discovery/DiscoveryEmpty';
import DiscoveryLoading from '@/components/discovery/DiscoveryLoading';
import DiscoveryError from '@/components/discovery/DiscoveryError';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/user';

const Discovery = () => {
  const navigate = useNavigate();
  const [matchDialog, setMatchDialog] = useState<Match | null>(null);

  const {
    currentProfile,
    remainingLikes,
    isLoading,
    error,
    canLike,
    noMoreProfiles,
    sendProfileLike,
    passProfile,
    refreshProfiles
  } = useDiscovery();

  const handleLike = async (
    targetType: 'prompt' | 'photo',
    targetId: string,
    comment?: string
  ) => {
    const result = await sendProfileLike(targetType, targetId, comment);
    if (result.match) {
      setMatchDialog(result.match);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground text-center">
            Discovery
          </h1>
        </header>
        <DiscoveryLoading />
      </div>
    );
  }

  if (error) {
    const isProfileError = error.includes('profile');
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground text-center">
            Discovery
          </h1>
        </header>
        <DiscoveryError message={error} showProfileLink={isProfileError} />
      </div>
    );
  }

  if (noMoreProfiles) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground text-center">
            Discovery
          </h1>
        </header>
        <DiscoveryEmpty />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-foreground">
            Discovery
          </h1>
          <span className="text-sm text-muted-foreground">
            {remainingLikes} likes left
          </span>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-md mx-auto p-4">
        {currentProfile && <ProfileCard profile={currentProfile} />}
      </main>

      {/* Action Bar */}
      {currentProfile && (
        <LikeSelector
          profile={currentProfile}
          canLike={canLike}
          remainingLikes={remainingLikes}
          onLike={handleLike}
          onPass={passProfile}
          onCancel={() => {}}
        />
      )}

      {/* Match Dialog */}
      <Dialog open={!!matchDialog} onOpenChange={(open) => !open && setMatchDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>It's a Match!</DialogTitle>
            <DialogDescription>
              You both liked each other. Start a conversation now!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setMatchDialog(null)}>
              Keep Swiping
            </Button>
            <Button onClick={() => navigate(`/chat?match=${matchDialog?.matchId}`)}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discovery;
