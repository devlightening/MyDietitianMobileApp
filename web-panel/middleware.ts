import { NextRequest, NextResponse } from 'next/server';

// Use 127.0.0.1 instead of localhost for better Windows compatibility
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:5000';

function redirectToLogin(req: NextRequest, pathname = '/auth/login') {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isAdminLogin = req.nextUrl.pathname === '/admin/login';

  if (isAdminLogin) {
    return NextResponse.next();
  }

  const token = req.cookies.get('access_token')?.value;
  const loginPath = isAdminRoute ? '/admin/login' : '/auth/login';

  // No token -> redirect to login
  if (!token) {
    console.log('[Middleware] No token, redirecting to login');
    return redirectToLogin(req, loginPath);
  }

  // Token exists -> validate with backend
  const cookieHeader = req.headers.get('cookie') ?? '';
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    if (res.status === 200) {
      console.log('[Middleware] Token valid, allowing access');
      return NextResponse.next();
    }

    // Invalid/expired token -> clear cookie + redirect to login
    if (res.status === 401 || res.status === 403) {
      console.log('[Middleware] Token invalid (401/403), clearing cookie and redirecting');
      const response = redirectToLogin(req, loginPath);
      response.cookies.set({
        name: 'access_token',
        value: '',
        path: '/',
        expires: new Date(0),
      });
      return response;
    }

    // Any other unexpected status -> treat as unauth to avoid loops
    console.log(`[Middleware] Unexpected status ${res.status}, clearing cookie and redirecting`);
    const response = redirectToLogin(req, loginPath);
    response.cookies.set({
      name: 'access_token',
      value: '',
      path: '/',
      expires: new Date(0),
    });
    return response;
  } catch (err) {
    // Backend unreachable -> fail closed to login (prevents infinite retry loops)
    console.error('[Middleware] Backend unreachable, redirecting to login:', err);
    return redirectToLogin(req, loginPath);
  }
}

export const config = {
  // Only run middleware on protected routes
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
