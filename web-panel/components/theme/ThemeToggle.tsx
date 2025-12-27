"use client";
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="px-3 py-2 rounded bg-muted text-foreground border"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      type="button"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
