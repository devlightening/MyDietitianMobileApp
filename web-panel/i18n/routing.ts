import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['tr', 'en'],

  // Used when no locale matches
  defaultLocale: 'tr',
  
  // Don't prefix routes with locale (use cookie-based)
  localePrefix: 'never',
  
  // Disable automatic locale detection
  localeDetection: false
});
