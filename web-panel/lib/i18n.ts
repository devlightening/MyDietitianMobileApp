// Simple i18n implementation without route changes
import { useTranslations as useNextIntlTranslations } from 'next-intl';

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

// Re-export for convenience
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

