'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

async function fetchClientIp() {
  const endpoints = [
    { url: 'https://api64.ipify.org?format=json', type: 'json', key: 'ip' },
    { url: 'https://api.ipify.org?format=json', type: 'json', key: 'ip' },
    { url: 'https://ipv4.icanhazip.com', type: 'text' },
    { url: 'https://icanhazip.com', type: 'text' },
  ];
  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(ep.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(t);
      if (!resp.ok) continue;
      if (ep.type === 'json') {
        const j = await resp.json();
        if (j && typeof j[ep.key] === 'string' && j[ep.key].trim()) return j[ep.key].trim();
      } else {
        const txt = (await resp.text()).trim();
        if (txt) return txt;
      }
    } catch (_) {}
  }
  return 'unknown';
}

export default function ConnectionLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loggedRef = useRef(new Set());

  useEffect(() => {
    const key = `${pathname}?${searchParams?.toString() || ''}`;
    if (loggedRef.current.has(key)) return;

    const log = async () => {
      try {
        const ip = await fetchClientIp();
        const payload = {
          ip,
          path: pathname,
          query: searchParams ? Object.fromEntries(searchParams.entries()) : {},
          referrer: typeof document !== 'undefined' ? (document.referrer || null) : null,
          userAgent: typeof navigator !== 'undefined' ? (navigator.userAgent || null) : null,
          language: typeof navigator !== 'undefined' ? (navigator.language || null) : null,
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : null,
          screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null,
        };
        await fetch('/api/save-ip-data', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        });
        loggedRef.current.add(key);
      } catch (_) {}
    };

    // small delay to ensure route settled
    const id = setTimeout(log, 300);
    return () => clearTimeout(id);
  }, [pathname, searchParams]);

  return null;
}


