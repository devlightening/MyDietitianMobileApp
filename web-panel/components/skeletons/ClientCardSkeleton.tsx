'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ClientCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <Skeleton className="h-4 w-24" />
    </Card>
  );
}

