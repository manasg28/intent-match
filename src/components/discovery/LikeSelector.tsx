import { useState } from 'react';
import { Heart, X, MessageCircle } from 'lucide-react';
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

type SelectionMode = 'idle' | 'selecting' | 'commenting';

interface Selection {
  type: 'prompt' | 'photo';
  id: string;
  label: string;
}

const LikeSelector = ({
  profile,
  canLike,
  remainingLikes,
  onLike,
  onPass,
  onCancel
}: LikeSelectorProps) => {
  const [mode, setMode] = useState<SelectionMode>('idle');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [comment, setComment] = useState('');

  const handleStartSelecting = () => {
    if (!canLike) return;
    setMode('selecting');
  };

  const handleSelect = (type: 'prompt' | 'photo', id: string, label: string) => {
    setSelection({ type, id, label });
    setMode('commenting');
  };

  const handleSendLike = () => {
    if (!selection) return;
    onLike(selection.type, selection.id, comment.trim() || undefined);
    resetState();
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const resetState = () => {
    setMode('idle');
    setSelection(null);
    setComment('');
  };

  if (!canLike) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            You've used all 5 likes for today
          </p>
          <p className="text-xs text-muted-foreground">
            Come back tomorrow to send more likes
          </p>
          <Button
            variant="outline"
            onClick={onPass}
            className="w-full"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'idle') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onPass}
              className="flex-1"
            >
              <X className="h-5 w-5 mr-2" />
              Pass
            </Button>
            <Button
              onClick={handleStartSelecting}
              className="flex-1"
            >
              <Heart className="h-5 w-5 mr-2" />
              Like ({remainingLikes} left)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'selecting') {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              What do you like?
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Tap on a photo or prompt to like it specifically
          </p>

          {/* Photos to select */}
          {profile.photos.length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-muted-foreground">Photos</p>
              {profile.photos.slice(0, 3).map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => handleSelect('photo', photo.id, `Photo ${index + 1}`)}
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted border-2 border-transparent hover:border-primary transition-colors"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Prompts to select */}
          {profile.prompts.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Prompts</p>
              {profile.prompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelect('prompt', prompt.id, prompt.question)}
                  className="w-full text-left rounded-lg border-2 border-border bg-card p-4 hover:border-primary transition-colors"
                >
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {prompt.question}
                  </p>
                  <p className="text-foreground">{prompt.answer}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'commenting') {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
        <div className="flex-1 max-w-md mx-auto p-4 w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Add a comment?
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setMode('selecting')}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="rounded-lg border border-primary bg-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Liking</span>
            </div>
            <p className="text-foreground">{selection?.label}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Optional comment
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Say something nice..."
              className="min-h-[100px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/200
            </p>
          </div>
        </div>

        <div className="border-t border-border p-4 safe-area-bottom">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={() => setMode('selecting')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSendLike}
              className="flex-1"
            >
              <Heart className="h-5 w-5 mr-2" />
              Send Like
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LikeSelector;
