import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for pathname:', pathname);
    console.log('Token:', token);

    // Handle undefined or invalid token cases
    if (!token) {
        // Allow access to login and register routes for unauthenticated users
        if (['/auth/login', '/auth/register'].includes(pathname)) {
            console.log('Allowing access to login/register for unauthenticated user');
            return NextResponse.next();
        }

        // Redirect unauthenticated users to the login page
        console.log('Redirecting unauthenticated user to /auth/login');
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect authenticated users away from login/register pages
    if (token && ['/auth/login', '/auth/register'].includes(pathname)) {
        console.log('Redirecting authenticated user to /');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If no conditions are matched, allow the request to proceed
    console.log('Proceeding with the request');
    return NextResponse.next();
}

// Exclude static assets, API routes, and public files
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt|sitemap.xml).*)',
    ],
};
