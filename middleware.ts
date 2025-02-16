import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for pathname:', pathname);
    console.log('Token:', token);

    // Handle undefined or invalid token cases
    if (!token) {
        // Allow access to login and register routes for unauthenticated users
        if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
            console.log('Allowing access to login/register for unauthenticated user');
            return NextResponse.next();
        }

        // Redirect unauthenticated users to the login page for all other routes
        console.log('Redirecting unauthenticated user to /auth/login');
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect authenticated users away from login/register pages
    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
        console.log('Redirecting authenticated user to /');
        return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Proceeding with the request');
    return NextResponse.next();
}

// Exclude static assets, API routes, and public files
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt|sitemap.xml).*)',
    ],
};
