// API Route for tracking page views with unique visitor detection
import { NextResponse } from 'next/server';
import { recordPageView } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { postId, visitorData } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Record the page view with unique visitor tracking
    const result = await recordPageView(postId, visitorData || {}, request);

    return NextResponse.json({
      success: true,
      counted: result.counted,
      reason: result.reason || 'view_recorded',
      fingerprint: result.fingerprint
    });

  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const timeWindow = searchParams.get('timeWindow') || '24h';

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const { analyticsManager } = await import('@/lib/analytics');
    const viewCount = await analyticsManager.getUniqueViewCount(postId, timeWindow);

    return NextResponse.json({
      postId,
      viewCount,
      timeWindow
    });

  } catch (error) {
    console.error('Error getting view count:', error);
    return NextResponse.json(
      { error: 'Failed to get view count' },
      { status: 500 }
    );
  }
}
