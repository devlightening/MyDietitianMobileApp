"use client";

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/theme/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export function Topbar() {
  const pathname = usePathname();
  const tCommon = useTranslations('common');
  const tClients = useTranslations('clients');
  const tAdmin = useTranslations('admin.ingredients');

  const getPageTitle = (): string => {
    // Admin routes
    if (pathname === '/admin/ingredients') {
      return tAdmin('title');
    }
    
    // Dietitian routes
    if (pathname === '/dashboard') return tCommon('dashboard');
    if (pathname === '/dashboard/recipes') return tCommon('recipes');
    if (pathname === '/dashboard/clients') return tCommon('clients');
    if (pathname?.startsWith('/dashboard/clients/')) return tClients('title');
    if (pathname === '/dashboard/access-keys') return tCommon('accessKeys');
    return tCommon('dashboard');
  };

  const title = getPageTitle();

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
