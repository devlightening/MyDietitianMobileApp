"use client";
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      className={cn(
        'relative w-10 h-10 rounded-lg flex items-center justify-center',
        'bg-muted hover:bg-muted/80 border border-border/50',
        'transition-all hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      type="button"
      aria-label="Toggle theme"
    >
      <Sun className={cn(
        'absolute w-4 h-4 text-foreground transition-all',
        isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
      )} />
      <Moon className={cn(
        'absolute w-4 h-4 text-foreground transition-all',
        isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
      )} />
    </button>
  );
}
