import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // Exclude static files and public assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/assets')
    ) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!token && !pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect authenticated users away from login/register pages
    if (token && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', req.url)); // Or dashboard URL
    }

    // Allow all other requests
    return NextResponse.next();
}

// ✅ Matcher: Only include routes that need middleware checks
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
