import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple cookie-based locale middleware
  // next-intl will handle locale from cookie via i18n/request.ts
  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
