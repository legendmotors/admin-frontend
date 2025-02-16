import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value; // Fetch token from cookies
    const { pathname } = req.nextUrl;

    // Allow unauthenticated access to static files and public routes
    if (
        pathname.startsWith('/_next') || // Next.js static files
        pathname.startsWith('/favicon.ico') || // Favicon
        pathname.startsWith('/auth') // Login/Register pages
    ) {
        return NextResponse.next(); // Allow access
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect authenticated users away from login/register pages
    if (token && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', req.url)); // Redirect to dashboard or home
    }

    return NextResponse.next();
}

// ✅ Matcher: Apply middleware only to relevant routes
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};
