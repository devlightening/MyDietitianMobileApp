import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-card shadow-md p-6 space-y-2 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}
