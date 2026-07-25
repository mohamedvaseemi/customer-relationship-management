import { NextResponse } from 'next/server';

export function proxy(request) {
    const token = request.cookies.get('token');
    const { pathname } = request.nextUrl;

    // Allow static files, assets, and API routes to pass through without auth redirection logic
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
    ) {
        return NextResponse.next();
    }

    const authPaths = ['/login', '/register'];
    const publicPaths = ['/terms', '/refund-policy', '/contact'];
    const isAuthPath = authPaths.includes(pathname);
    const isPublicPath = publicPaths.includes(pathname) || isAuthPath;

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (token && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)'],
};
