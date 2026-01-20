import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/types/user';

interface LikeSelectorProps {
  profile: UserProfile;
  canLike: boolean;
  remainingLikes: number;
  onLike: (targetType: 'prompt' | 'photo', targetId: string, comment?: string) => void;
  onPass: () => void;
  onCancel: () => void;
}

const LikeSelector = ({
  profile,
  canLike,
  remainingLikes,
  onLike,
  onPass,
  onCancel
}: LikeSelectorProps) => {
  const [selectedTarget, setSelectedTarget] = useState<{
    type: 'prompt' | 'photo';
    id: string;
    content: string;
  } | null>(null);
  const [comment, setComment] = useState('');

  const handleSelectPrompt = (promptId: string, question: string) => {
    setSelectedTarget({ type: 'prompt', id: promptId, content: question });
  };

  const handleSelectPhoto = (photoId: string) => {
    setSelectedTarget({ type: 'photo', id: photoId, content: 'photo' });
  };

  const handleConfirmLike = () => {
    if (!selectedTarget) return;
    onLike(selectedTarget.type, selectedTarget.id, comment.trim() || undefined);
    setSelectedTarget(null);
    setComment('');
  };

  const handleCancel = () => {
    setSelectedTarget(null);
    setComment('');
    onCancel();
  };

  // Daily limit reached
  if (!canLike) {
    return (
      <div className="space-y-4 py-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">That's everyone for today.</p>
          <p className="text-sm text-muted-foreground">Come back tomorrow.</p>
        </div>
        <Button variant="ghost" onClick={onPass} className="w-full h-11 text-muted-foreground">
          Continue browsing
        </Button>
      </div>
    );
  }

  // Confirm like with comment
  if (selectedTarget) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-lifted">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {selectedTarget.type === 'prompt' ? 'Liking their answer' : 'Liking their photo'}
          </p>
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows={2}
          className="resize-none"
        />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleCancel} className="flex-1 h-11">
            Cancel
          </Button>
          <Button onClick={handleConfirmLike} className="flex-1 h-11">
            Send
          </Button>
        </div>
      </div>
    );
  }

  // Selection view
  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Tap a prompt or photo to like
      </p>

      {profile.prompts.length > 0 && (
        <div className="space-y-3">
          {profile.prompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSelectPrompt(prompt.id, prompt.question)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-soft transition-gentle hover:shadow-lifted hover:border-muted-foreground"
            >
              <p className="text-sm font-medium text-muted-foreground mb-2">{prompt.question}</p>
              <p className="text-foreground">{prompt.answer}</p>
            </button>
          ))}
        </div>
      )}

      {profile.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {profile.photos.slice(0, 3).map((photo) => (
            <button
              key={photo.id}
              onClick={() => handleSelectPhoto(photo.id)}
              className="photo-frame aspect-square transition-gentle hover:opacity-90"
            >
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Button variant="ghost" onClick={onPass} className="w-full h-11 text-muted-foreground">
        Pass
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {remainingLikes} {remainingLikes === 1 ? 'like' : 'likes'} remaining today
      </p>
    </div>
  );
};

export default LikeSelector;
