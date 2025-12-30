// Server-only: check if an access_token cookie exists
export function isAuthenticatedServer(): boolean {
  const { cookies } = require('next/headers');
  const token = cookies().get('access_token');
  return !!token;
}

// Client: perform logout by calling backend to clear HttpOnly cookie
export async function logout(): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = base ? `${base}/api/auth/logout` : '/api/auth/logout';
  try {
    await fetch(url, { method: 'POST', credentials: 'include' });
  } catch {
    // swallow
  }
}
