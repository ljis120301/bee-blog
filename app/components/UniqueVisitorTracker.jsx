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
          console.log('Page view tracked:', result.counted ? 'counted' : 'duplicate');
          // Store fingerprint in session for future reference
          sessionStorage.setItem('visitor_fingerprint', result.fingerprint || '');
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
