import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for pathname:', pathname);
    console.log('Token:', token);

    // Prevent unauthenticated users from accessing protected routes
    if (!token) {
        if (['/auth/login', '/auth/register'].includes(pathname)) {
            console.log('Allowing access to login/register for unauthenticated user');
            return NextResponse.next();
        }

        console.log('Redirecting unauthenticated user to /auth/login');
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Prevent authenticated users from accessing login/register
    if (token && ['/auth/login', '/auth/register'].includes(pathname)) {
        console.log('Redirecting authenticated user to /');
        return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Authenticated user, proceeding with the request');
    return NextResponse.next();
}

// Exclude static assets, API routes, and public files
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt|sitemap.xml).*)',
    ],
};
