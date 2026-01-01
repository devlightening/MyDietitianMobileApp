import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookie, default to 'tr'
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'tr') as 'tr' | 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
