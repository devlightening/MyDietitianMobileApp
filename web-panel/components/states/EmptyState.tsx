'use client';

import { Card } from '@/components/ui/Card';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon || <Users className="h-8 w-8 text-muted-foreground" />}
        </div>

        <h2 className="text-lg font-semibold text-foreground">{title}</h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          {description}
        </p>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </Card>
  );
}

