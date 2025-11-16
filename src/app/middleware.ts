// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is authenticated (you'll need to verify Firebase token)
  const isAuthenticated = request.cookies.has('firebase-token');
  
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};