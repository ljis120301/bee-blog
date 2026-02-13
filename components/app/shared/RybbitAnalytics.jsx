'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

/**
 * RybbitAnalytics – bulletproof client-side page-view tracking for Next.js.
 *
 * Why this component exists:
 *   Rybbit's script.js listens for History API changes (pushState / popState)
 *   to auto-track SPA navigations. On some mobile browsers (Safari, in-app
 *   webviews, PWA mode) those events can be swallowed or fired before the
 *   script has finished initialising. By also listening to Next.js route
 *   changes via usePathname / useSearchParams we guarantee every navigation
 *   is recorded – even if the History listener misses it.
 *
 * De-duplication:
 *   Rybbit de-duplicates page views server-side, so a double-fire from both
 *   the History listener AND our explicit call is harmless.
 */
export default function RybbitAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRender = useRef(true);

    // Track route changes after the initial page load
    useEffect(() => {
        // Skip the first render – the Rybbit script handles the initial pageview
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Wait a tick for the page title / DOM to settle, then fire pageview
        const id = setTimeout(() => {
            if (typeof window !== 'undefined' && window.rybbit && typeof window.rybbit.pageview === 'function') {
                window.rybbit.pageview();
            }
        }, 150);

        return () => clearTimeout(id);
    }, [pathname, searchParams]);

    const shouldLoad =
        process.env.NODE_ENV === 'production' ||
        process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

    if (!shouldLoad) return null;

    return (
        <Script
            src="/rb/script.js"
            data-site-id="ffc635a8aed3"
            strategy="afterInteractive"
        />
    );
}
