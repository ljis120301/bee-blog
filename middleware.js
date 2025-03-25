import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for the x-middleware-subrequest header
  const hasMiddlewareSubrequest = request.headers.get('x-middleware-subrequest');
  
  if (hasMiddlewareSubrequest) {
    // Block the request if the header is present
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 