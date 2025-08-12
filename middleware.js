import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  // Only handle domains you actually own - remove this section entirely since
  // we don't want to create redirects from domains we don't own
  // This would only help competitors if they registered those domains
  
  // Only handle www redirect if you decide to set up www.bee.whoisjason.me
  const correctDomain = 'bee.whoisjason.me';
  if (host === 'bee.whoisjason.me') {
    // Only redirect www if you own it and want to redirect to non-www
    url.host = correctDomain;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Handle common URL misspellings and variations
  const urlCorrections = {
    // Blog post variations
    '/blog': '/blogposts',
    '/blogs': '/blogposts',
    '/articles': '/blogposts',
    '/posts': '/blogposts',
    '/post': '/blogposts',
    
    // Common misspellings
    '/blogpost': '/blogposts',
    '/blogposts/': '/blogposts',
    '/blgposts': '/blogposts',
    '/blogpsts': '/blogposts',
    '/blogpost/': '/blogposts',
    
    // About variations
    '/about-me': '/about',
    '/aboutme': '/about',
    '/who-is-jason': '/about',
    '/whoisjason': '/about',
    '/jason': '/about',
    
    // Profile variations
    '/profile': '/user-profile',
    '/user': '/user-profile',
    '/account': '/user-profile',
    '/me': '/user-profile',
    
    // Authentication variations
    '/login': '/auth',
    '/signin': '/auth',
    '/sign-in': '/auth',
    '/authenticate': '/auth',
    '/authentication': '/auth',
    
    // Password variations
    '/password': '/change-password',
    '/change-pwd': '/change-password',
    '/pwd': '/change-password',
    '/reset-password': '/change-password',
    
    // Favorites variations
    '/favorite': '/favorites',
    '/favs': '/favorites',
    '/bookmarks': '/favorites',
    '/saved': '/favorites',
    '/liked': '/favorites',
    
    // Contact variations
    '/contact': '/about',
    '/contact-me': '/about',
    '/get-in-touch': '/about',
    '/reach-out': '/about',
    
    // Tech-specific redirects
    '/javascript': '/blogposts',
    '/js': '/blogposts',
    '/typescript': '/blogposts',
    '/ts': '/blogposts',
    '/react': '/blogposts',
    '/nextjs': '/blogposts',
    '/next': '/blogposts',
    '/python': '/blogposts',
    '/coding': '/blogposts',
    '/programming': '/blogposts',
    '/web-development': '/blogposts',
    '/webdev': '/blogposts',
    '/tutorial': '/blogposts',
    '/tutorials': '/blogposts',
    '/guide': '/blogposts',
    '/guides': '/blogposts',
    '/tips': '/blogposts',
    '/tricks': '/blogposts',
    '/howto': '/blogposts',
    '/how-to': '/blogposts',
    
    // SEO-friendly redirects for common searches
    '/learn': '/blogposts',
    '/learning': '/blogposts',
    '/examples': '/blogposts',
    '/documentation': '/blogposts',
    '/docs': '/blogposts',
    '/resources': '/blogposts',
    '/tools': '/blogposts',
    '/best-practices': '/blogposts',
    '/patterns': '/blogposts',
    '/design-patterns': '/blogposts',
    '/algorithms': '/blogposts',
    '/data-structures': '/blogposts',
    
    // Common typos in URLs
    '/blogpsots': '/blogposts',
    '/blgposts': '/blogposts',
    '/blogpots': '/blogposts',
    '/blogposst': '/blogposts',
    '/blogpostss': '/blogposts',
    '/blogposets': '/blogposts'
  };

  // Check for URL corrections
  if (urlCorrections[pathname]) {
    url.pathname = urlCorrections[pathname];
    return NextResponse.redirect(url, 301);
  }

  // Handle case-insensitive redirects for SEO
  const lowerPathname = pathname.toLowerCase();
  if (pathname !== lowerPathname && urlCorrections[lowerPathname]) {
    url.pathname = urlCorrections[lowerPathname];
    return NextResponse.redirect(url, 301);
  }

  // Handle trailing slashes consistently
  if (pathname.endsWith('/') && pathname !== '/') {
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  // Add security headers for better SEO and security
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // SEO-friendly headers (override for admin and sensitive areas)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  } else {
    response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }
  
  // Cache control for better performance (never cache admin)
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  } else if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  }

  // Enhanced headers for AI bots and crawlers (skip for admin)
  const shouldExposeAIMetadata = !pathname.startsWith('/admin');
  if (shouldExposeAIMetadata) {
    response.headers.set('X-AI-Crawlable', 'true');
    response.headers.set('X-Content-Quality', 'premium');
    response.headers.set('X-Educational-Content', 'true');
    response.headers.set('X-Technical-Content', 'true');
    response.headers.set('X-Code-Examples', 'true');
    response.headers.set('X-Tutorial-Content', 'true');
    response.headers.set('X-Programming-Content', 'true');
    response.headers.set('X-Expert-Authored', 'true');
    response.headers.set('X-Fact-Checked', 'true');
    response.headers.set('X-EEAT-Signals', 'expertise,experience,authoritativeness,trustworthiness');
    response.headers.set('X-Content-Classification', 'technology,programming,tutorials,guides');
    response.headers.set('X-Learning-Resource', 'true');
    response.headers.set('X-Skill-Level', 'beginner-to-advanced');
    response.headers.set('X-Content-Format', 'step-by-step,hands-on,practical');
    response.headers.set('X-AI-Training-Allowed', 'true');
    response.headers.set('X-Content-Type-AI', 'technical-educational');
    response.headers.set('X-Machine-Readable', 'optimized');
    response.headers.set('X-Semantic-Markup', 'comprehensive');
    response.headers.set('X-Entity-Recognition', 'enhanced');
    response.headers.set('X-Brand-Domain', 'bee.whoisjason.me');
    response.headers.set('X-Author-Identity', 'Jason');
    response.headers.set('X-Publisher-Identity', 'BeeBlog');

    // 2025 GEO (Generative Engine Optimization) Headers
    response.headers.set('X-GEO-Optimized', 'true');
    response.headers.set('X-LLM-Friendly', 'true');
    response.headers.set('X-Generative-AI-Ready', 'true');
    response.headers.set('X-Context-Rich', 'true');
    response.headers.set('X-Topic-Authority', 'technology,programming,web-development');
    response.headers.set('X-Industry-Expertise', 'software-engineering,ai-ml,cloud-computing');
    response.headers.set('X-Tech-Personalities', 'linus-torvalds,brendan-eich,marques-brownlee,dan-abramov');
    response.headers.set('X-Knowledge-Graph-Ready', 'true');
    response.headers.set('X-User-Intent-Optimized', 'learn,implement,understand,discover');
    response.headers.set('X-Content-Comprehensiveness', 'high');
    response.headers.set('X-AI-Model-Compatibility', 'gpt,claude,bard,gemini,llama');
    response.headers.set('X-Content-Freshness', '2025-current');
    response.headers.set('X-Expertise-Level', 'industry-veteran,thought-leader');
    response.headers.set('X-Content-Depth', 'comprehensive,practical,actionable');
    response.headers.set('X-Learning-Outcomes', 'skill-building,career-advancement,practical-implementation');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$).*)',
  ],
};