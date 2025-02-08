import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // Allow access to both login and register pages without authentication
    if (!token && !['/auth/login', '/auth/register'].includes(pathname)) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect authenticated users away from login and register pages
    if (token && ['/auth/login', '/auth/register'].includes(pathname)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}


// ✅ Exclude static assets from authentication checks
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
