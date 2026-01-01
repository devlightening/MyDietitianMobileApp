"use client";

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/dashboard/recipes') return 'Recipes';
  if (pathname === '/dashboard/clients') return 'Clients';
  if (pathname?.startsWith('/dashboard/clients/')) return 'Client Details';
  if (pathname === '/dashboard/access-keys') return 'Access Keys';
  return 'Dashboard';
};

export function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname || '');

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
