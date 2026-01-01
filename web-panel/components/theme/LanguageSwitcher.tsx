"use client";

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale || isPending) return;
    
    startTransition(() => {
      // Set locale cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      // Reload page to apply new locale
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={locale === 'tr' ? 'primary' : 'secondary'}
        onClick={() => switchLocale('tr')}
        disabled={isPending}
        className="min-w-[60px] text-sm px-3 py-1.5"
      >
        🇹🇷 TR
      </Button>
      <Button
        variant={locale === 'en' ? 'primary' : 'secondary'}
        onClick={() => switchLocale('en')}
        disabled={isPending}
        className="min-w-[60px] text-sm px-3 py-1.5"
      >
        🇬🇧 EN
      </Button>
    </div>
  );
}
