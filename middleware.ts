import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for pathname:', pathname);
    console.log('Token:', token);

    // Allow access to login and register pages without authentication
    if (!token && ['/auth/login', '/auth/register'].includes(pathname)) {
        console.log('Allowing access to login/register page');
        return NextResponse.next();
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!token) {
        console.log('Redirecting to /auth/login');
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect authenticated users away from login and register pages
    if (token && ['/auth/login', '/auth/register'].includes(pathname)) {
        console.log('Redirecting authenticated user to /');
        return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Proceeding with the request');
    return NextResponse.next();
}

// ✅ Add back the matcher to exclude unnecessary routes
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt|sitemap.xml).*)',
    ],
};
