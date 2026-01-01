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
        'rounded-xl bg-card border border-border shadow-sm transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
