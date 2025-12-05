// Unique Visitor Tracking Component with Browser Fingerprinting
'use client';
import { useEffect, useRef } from 'react';

export default function UniqueVisitorTracker({ postId, userId = null }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (!postId || trackedRef.current) return;

    const trackPageView = async () => {
      try {
        // Generate browser fingerprint data
        const visitorData = await generateVisitorFingerprint();
        
        // Add user context
        visitorData.isAuthenticated = !!userId;
        visitorData.userId = userId;
        visitorData.referrer = document.referrer || 'direct';
        // Maintain one session id per domain visit; rotate daily
        visitorData.sessionId = getOrCreateSessionId();

        // Send to analytics API
        const response = await fetch('/api/analytics/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId,
            visitorData
          })
        });

        const result = await response.json();
        
        if (result.success) {
          if (result.reason === 'missing_credentials') {
            console.warn('Page view skipped: PocketBase credentials missing (dev fallback).');
            return;
          }
          console.log('Page view tracked:', result.counted ? 'counted' : 'duplicate');
          // Store fingerprint in session for future reference
          sessionStorage.setItem('visitor_fingerprint', result.fingerprint || '');
          // Start client-side metrics collection for this session
          startMetricsCollection(postId, visitorData.sessionId);
        } else {
          console.error('Failed to track page view:', result.error);
        }

      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    // Track after a short delay to ensure page is loaded
    const timeoutId = setTimeout(() => {
      trackPageView();
      trackedRef.current = true;
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [postId, userId]);

  return null; // This component doesn't render anything
}

// Generate comprehensive visitor fingerprint
async function generateVisitorFingerprint() {
  const fingerprint = {
    // Screen and display info
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || navigator.userLanguage,
    
    // Browser capabilities
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    onLine: navigator.onLine,
    
    // Platform info
    platform: navigator.platform,
    
    // Additional fingerprinting data
    pixelRatio: window.devicePixelRatio || 1,
    
    // Viewport size
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    
    // Touch support
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Canvas fingerprinting (basic)
    canvas: generateCanvasFingerprint(),
    
    // WebGL fingerprinting (basic)
    webgl: generateWebGLFingerprint(),
    
    // Available fonts (basic detection)
    fonts: await detectAvailableFonts(),
    
    // Local storage support
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    
    // Timestamp for tracking
    timestamp: new Date().toISOString()
  };
  // Obtain client IP via third-party API (do not rely on Next.js headers)
  try {
    fingerprint.clientIp = await fetchClientIp();
  } catch (_) {
    fingerprint.clientIp = 'unknown';
  }
  return fingerprint;
}

// Generate canvas fingerprint
function generateCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw some text and shapes
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('UniqueVisitor Fingerprint 🐝', 2, 2);
    
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillRect(100, 5, 80, 20);
    
    return canvas.toDataURL().slice(-100); // Last 100 chars for brevity
  } catch (error) {
    return 'canvas_error';
  }
}

// Generate WebGL fingerprint
function generateWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no_webgl';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    return `${vendor}_${renderer}`.slice(0, 50);
  } catch (error) {
    return 'webgl_error';
  }
}

// Start collecting time-on-page, scroll depth, and interactions for this session
function startMetricsCollection(postId, sessionId) {
  try {
    let interactions = 0;
    let maxScrollPct = 0;
    const startedAt = Date.now();
    let inFlight = false;
    let pendingReason = null;

    const onClick = () => { interactions += 1; };
    const onKey = () => { interactions += 1; };
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('keydown', onKey, { passive: true });

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      const viewport = window.innerHeight || document.documentElement.clientHeight || 0;
      const totalScrollable = Math.max(1, docHeight - viewport);
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / totalScrollable) * 100)));
      if (pct > maxScrollPct) maxScrollPct = pct;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const flush = async (isFinal = false) => {
      if (inFlight) { pendingReason = isFinal ? 'final' : (pendingReason || 'event'); return; }
      inFlight = true;
      const elapsedSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      const engagement = interactions > 10 || maxScrollPct > 70 ? 'high' : interactions > 3 || maxScrollPct > 30 ? 'medium' : 'low';
      try {
        await fetch('/api/analytics/page-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            sessionId,
            metrics: {
              timeOnPageSec: elapsedSec,
              scrollDepthPct: maxScrollPct,
              interactions,
              engagement
            }
          })
        });
      } catch (_) {}
      inFlight = false;
      if (pendingReason) {
        const reason = pendingReason; pendingReason = null;
        // schedule a microtask flush to batch rapid events
        setTimeout(() => flush(reason === 'final'), 0);
        return;
      }
      if (isFinal) {
        window.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('scroll', onScroll);
      }
    };

    // immediate flush on interaction events
    const immediateFlush = () => flush(false);
    window.addEventListener('click', immediateFlush, { passive: true });
    window.addEventListener('keydown', immediateFlush, { passive: true });

    // debounce scroll flush
    let scrollTimer = null;
    const onScrollDebounced = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => flush(false), 600);
    };
    window.addEventListener('scroll', onScrollDebounced, { passive: true });

    // on unload, ensure final flush
    const onBeforeUnload = () => {
      try {
        const payload = {
          postId,
          sessionId,
          metrics: {
            timeOnPageSec: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
            scrollDepthPct: maxScrollPct,
            interactions,
            engagement: interactions > 10 || maxScrollPct > 70 ? 'high' : interactions > 3 || maxScrollPct > 30 ? 'medium' : 'low'
          }
        };
        navigator.sendBeacon('/api/analytics/page-metrics', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      } catch (_) {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    // stop collection when route changes
    const stop = () => {
      flush(true);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('click', immediateFlush);
      window.removeEventListener('keydown', immediateFlush);
      window.removeEventListener('scroll', onScrollDebounced);
    };
    // Heuristic: stop after 20 minutes
    setTimeout(stop, 20 * 60 * 1000);
  } catch (e) {
    console.warn('Metrics collection failed:', e);
  }
}

// Fetch client IP address using third-party services with graceful fallbacks
async function fetchClientIp() {
  const candidates = [
    { url: 'https://api64.ipify.org?format=json', type: 'json', key: 'ip' },
    { url: 'https://api.ipify.org?format=json', type: 'json', key: 'ip' },
    { url: 'https://ipv4.icanhazip.com', type: 'text' },
    { url: 'https://icanhazip.com', type: 'text' }
  ];

  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(candidate.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      if (!resp.ok) continue;
      if (candidate.type === 'json') {
        const data = await resp.json();
        if (data && typeof data[candidate.key] === 'string' && data[candidate.key].trim()) {
          return data[candidate.key].trim();
        }
      } else {
        const text = (await resp.text()).trim();
        if (text) return text;
      }
    } catch (_) {
      // Try next provider
    }
  }

  return 'unknown';
}

// Detect available fonts (simplified)
async function detectAvailableFonts() {
  const testFonts = [
    'Arial', 'Times New Roman', 'Courier New', 'Helvetica', 'Georgia',
    'Verdana', 'Comic Sans MS', 'Impact', 'Arial Black', 'Tahoma',
    'Trebuchet MS', 'Lucida Console', 'Monaco', 'Consolas'
  ];

  const availableFonts = [];
  
  // Create a test element
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  testElement.style.fontSize = '72px';
  testElement.innerHTML = 'mmmmmmmmmmlli';
  document.body.appendChild(testElement);

  // Test default width
  testElement.style.fontFamily = 'monospace';
  const defaultWidth = testElement.offsetWidth;

  // Test each font
  for (const font of testFonts) {
    testElement.style.fontFamily = `${font}, monospace`;
    if (testElement.offsetWidth !== defaultWidth) {
      availableFonts.push(font);
    }
  }

  document.body.removeChild(testElement);
  return availableFonts.join(',');
}

// Get or create session ID
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  
  return sessionId;
}

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
