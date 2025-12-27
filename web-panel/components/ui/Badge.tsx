import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent',
        variant === 'secondary' && 'bg-muted/20 text-muted-foreground',
        variant === 'danger' && 'bg-danger/10 text-danger',
        className
      )}
    >
      {children}
    </span>
  );
}
