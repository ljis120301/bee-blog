// API Route to record per-session page metrics (time on page, scroll depth, interactions)
import { NextResponse } from 'next/server';
import { analyticsManager } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { postId, sessionId, metrics } = body || {};
    if (!postId || !sessionId) {
      return NextResponse.json({ success: false, error: 'postId and sessionId required' }, { status: 400 });
    }

    const result = await analyticsManager.recordPageMetrics(postId, sessionId, metrics || {});

    if (result?.reason === 'missing_credentials') {
      // Dev fallback: silently no-op
      return NextResponse.json({ success: true, updated: false, reason: 'missing_credentials' });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error recording page metrics:', error);
    return NextResponse.json({ success: false, error: 'Failed to record metrics' }, { status: 500 });
  }
}


