import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserPrompt } from '@/types/user';
import { PROMPT_OPTIONS } from '@/services/profileService';
import { X, ChevronDown } from 'lucide-react';

interface PromptEditorProps {
  prompts: UserPrompt[];
  onPromptsChange: (prompts: UserPrompt[]) => void;
  maxPrompts?: number;
}

const PromptEditor = ({ prompts, onPromptsChange, maxPrompts = 3 }: PromptEditorProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState('');

  const usedQuestions = new Set(prompts.map((p) => p.question));
  const availableQuestions = PROMPT_OPTIONS.filter((q) => !usedQuestions.has(q));

  const handleSelectQuestion = (question: string) => {
    const newPrompt: UserPrompt = {
      id: `prompt_${Date.now()}`,
      question,
      answer: '',
    };
    onPromptsChange([...prompts, newPrompt]);
    setIsSelecting(false);
    setEditingId(newPrompt.id);
    setEditingAnswer('');
  };

  const handleSaveAnswer = () => {
    if (!editingId || !editingAnswer.trim()) return;

    const updated = prompts.map((p) =>
      p.id === editingId ? { ...p, answer: editingAnswer.trim() } : p
    );
    onPromptsChange(updated);
    setEditingId(null);
    setEditingAnswer('');
  };

  const handleRemovePrompt = (id: string) => {
    onPromptsChange(prompts.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingAnswer('');
    }
  };

  const handleStartEdit = (prompt: UserPrompt) => {
    setEditingId(prompt.id);
    setEditingAnswer(prompt.answer);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Answer {maxPrompts} prompts to help others get to know you.
      </p>

      {/* Existing prompts */}
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="rounded-lg border border-border bg-card p-4 shadow-soft"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {prompt.question}
            </p>
            <button
              onClick={() => handleRemovePrompt(prompt.id)}
              className="text-muted-foreground hover:text-foreground transition-gentle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {editingId === prompt.id ? (
            <div className="mt-3 space-y-3">
              <Textarea
                value={editingAnswer}
                onChange={(e) => setEditingAnswer(e.target.value)}
                placeholder="Your answer..."
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(null);
                    setEditingAnswer('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAnswer}
                  disabled={!editingAnswer.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleStartEdit(prompt)}
              className="mt-2 w-full text-left"
            >
              {prompt.answer ? (
                <p className="text-foreground">{prompt.answer}</p>
              ) : (
                <p className="text-muted-foreground italic">Tap to answer...</p>
              )}
            </button>
          )}
        </div>
      ))}

      {/* Add prompt */}
      {prompts.length < maxPrompts && (
        <>
          {isSelecting ? (
            <div className="space-y-2">
              {availableQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSelectQuestion(question)}
                  className="w-full rounded-lg border border-border bg-card p-4 text-left text-foreground shadow-soft transition-gentle hover:bg-secondary/50"
                >
                  {question}
                </button>
              ))}
              <Button
                variant="ghost"
                onClick={() => setIsSelecting(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsSelecting(true)}
              className="w-full h-12 justify-between"
            >
              <span>Add a prompt</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default PromptEditor;
