'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        {title && (
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        )}

        <p className="max-w-sm text-sm text-muted-foreground">
          {message}
        </p>

        {onRetry && (
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

