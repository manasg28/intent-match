import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Match, UserProfile, Message } from '@/types/user';
import { sendMessage, subscribeToMessages, validateFirstMessage } from '@/services/chatService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatViewProps {
  match: Match;
  otherProfile: UserProfile;
}

const ChatView = ({ match, otherProfile }: ChatViewProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFirstMessage = messages.length === 0;

  useEffect(() => {
    if (!match.matchId) return;

    const unsubscribe = subscribeToMessages(match.matchId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [match.matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setError('');

    if (isFirstMessage) {
      const validation = validateFirstMessage(newMessage);
      if (!validation.valid) {
        setError(validation.error || 'Invalid message');
        return;
      }
    }

    setSending(true);
    try {
      await sendMessage(match.matchId, user.uid, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-secondary border-b border-border p-4">
        <p className="text-sm font-medium text-foreground mb-1">
          You matched on:
        </p>
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-sm text-muted-foreground mb-1 capitalize">
            {match.initiatingLike.targetType}
          </p>
          <p className="text-foreground whitespace-pre-wrap">
            {match.initiatingLike.targetContent}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderUid === user?.uid;
          return (
            <div
              key={message.messageId}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        {isFirstMessage && (
          <div className="mb-3 rounded-lg bg-secondary p-3">
            <p className="text-sm text-foreground font-medium mb-1">
              First message tips:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• At least 10 characters</li>
              <li>• Reference what you matched on</li>
              <li>• Be thoughtful (no "hey", "hi", or "hello")</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isFirstMessage
                ? 'Write a thoughtful first message...'
                : 'Type a message...'
            }
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
