import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for pathname:', pathname);
    console.log('Cookies:', req.cookies.getAll());
    console.log('Token:', token);

    // Allow unauthenticated users to access login/register pages
    if (!token) {
        if (pathname.startsWith('/auth')) {
            console.log('Allowing access to auth pages');
            return NextResponse.next();
        }
        console.log('Redirecting unauthenticated user to /auth/login');
        return NextResponse.redirect(new URL('/auth/login', req.nextUrl.origin));
    }

    // Redirect authenticated users away from login/register pages
    if (token && pathname.startsWith('/auth')) {
        console.log('Redirecting authenticated user to /');
        return NextResponse.redirect(new URL('/', req.nextUrl.origin));
    }

    console.log('User is authenticated, allowing access');
    return NextResponse.next();
}

// Updated matcher to exclude additional static assets and public files
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt|sitemap.xml|manifest.json).*)',
    ],
};
