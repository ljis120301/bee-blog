// API Route for admin dashboard analytics data
import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/analytics';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    // Validate PocketBase auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    try {
      pb.authStore.save(token, null);
      // Verify token and load user model
      await pb.collection('users').authRefresh();
      const user = pb.authStore.model;
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Get analytics data
    const analyticsData = await getAnalyticsData(timeRange);

    // Get additional metrics
    const totalUsers = await pb.collection('users').getList(1, 1, {
      '$autoCancel': false
    }).then(result => result.totalItems).catch(() => 0);

    const totalPosts = await pb.collection('posts').getList(1, 1, {
      '$autoCancel': false
    }).then(result => result.totalItems).catch(() => 0);

    // Calculate additional metrics
    const bounceRate = Math.floor(Math.random() * 20) + 25; // Placeholder - would need session tracking
    const avgTimeOnPage = Math.floor(Math.random() * 180) + 120; // Placeholder - would need session tracking

    const response = NextResponse.json({
      success: true,
      data: {
        totalPageViews: analyticsData.totalViews,
        totalUniqueVisitors: analyticsData.totalUniqueVisitors,
        averageTimeOnPage: avgTimeOnPage,
        averageBounceRate: bounceRate,
        totalUsers,
        totalPosts,
        topPosts: analyticsData.topPosts,
        userAgentStats: analyticsData.userAgentStats,
        averageViewsPerDay: analyticsData.averageViewsPerDay,
        timeRange: analyticsData.timeRange,
        periodDays: analyticsData.periodDays,
        recentSessions: analyticsData.recentSessions
      }
    });
    return response;

  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
  finally {
    // Prevent token leakage across requests
    try { pb.authStore.clear(); } catch {}
  }
}
