import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          variant === 'primary' && 'bg-accent text-white hover:bg-accent-dark',
          variant === 'secondary' && 'bg-muted text-foreground hover:bg-muted-dark',
          variant === 'danger' && 'bg-danger text-white hover:bg-danger-dark',
          (disabled || loading) && 'opacity-60 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading ? <span className="animate-pulse">...</span> : children}
      </button>
    );
  }
);
Button.displayName = 'Button';
