import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessingScreenProps {
  progress: number;
  type: 'processing' | 'encryption';
  onCancel?: () => void;
}

const processingMessages = [
  'Reading employee database...',
  'Analyzing PDF document...',
  'Matching names across pages...',
  'Splitting PDF into individual pages...',
  'Applying naming conventions...',
];

const encryptionMessages = [
  'Loading encryption keys...',
  'Generating secure passwords...',
  'Encrypting PDF files...',
  'Verifying encryption...',
  'Finalizing secure documents...',
];

export const ProcessingScreen = ({ progress, type, onCancel }: ProcessingScreenProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = type === 'processing' ? processingMessages : encryptionMessages;

  useEffect(() => {
    const messageIndex = Math.min(
      Math.floor((progress / 100) * messages.length),
      messages.length - 1
    );
    setCurrentMessageIndex(messageIndex);
  }, [progress, messages.length]);

  const estimatedTime = Math.max(1, Math.ceil((100 - progress) / 20));

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">
          {type === 'processing' ? 'Processing...' : 'Encrypting...'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 py-8">
        <div className="flex justify-center">
          <div className="relative">
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{messages[currentMessageIndex]}</span>
            <span>~{estimatedTime}s remaining</span>
          </div>
        </div>

        <div className="space-y-2 text-center">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`text-sm transition-all ${
                index < currentMessageIndex
                  ? 'text-success'
                  : index === currentMessageIndex
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/50'
              }`}
            >
              {index < currentMessageIndex ? '✓ ' : index === currentMessageIndex ? '→ ' : '○ '}
              {message}
            </div>
          ))}
        </div>

        {onCancel && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
