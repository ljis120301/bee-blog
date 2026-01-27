/**
 * Analytics Dashboard API - Prisma Version
 * =========================================
 * Provides analytics data for admin dashboard
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    // Check admin auth via session cookie
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '1d': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get basic stats from Prisma
    const [totalUsers, totalPosts, topPostsRaw] = await Promise.all([
      db.user.count(),
      db.post.count({ where: { published: true } }),
      db.post.findMany({
        where: { published: true },
        orderBy: { views: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
        }
      })
    ]);

    const topPosts = topPostsRaw.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      views: p.views || 0,
    }));

    // Calculate total page views from posts
    const postsWithViews = await db.post.aggregate({
      _sum: { views: true }
    });
    const totalPageViews = postsWithViews._sum.views || 0;

    // Read JSON IP log for recent connections
    let recentConnections = [];
    try {
      const filePath = path.join(process.cwd(), 'data', 'ip-data.json');
      const raw = await fs.readFile(filePath, 'utf-8');
      const all = JSON.parse(raw);
      if (Array.isArray(all)) {
        recentConnections = all.slice(-50).reverse();
      }
    } catch (_) {
      recentConnections = [];
    }

    // Calculate period days
    const periodDays = Math.max(1, Math.round((now - startDate) / (24 * 60 * 60 * 1000)));

    // Placeholder values for advanced analytics (not yet tracked)
    const avgTimeOnPage = 180; // 3 minutes average
    const bounceRate = 35;
    const uniqueVisitors = Math.floor(totalPageViews * 0.6); // Rough estimate

    return NextResponse.json({
      success: true,
      data: {
        totalPageViews,
        totalUniqueVisitors: uniqueVisitors,
        averageTimeOnPage: avgTimeOnPage,
        averageBounceRate: bounceRate,
        totalUsers,
        totalPosts,
        topPosts,
        userAgentStats: {},
        averageViewsPerDay: Math.round(totalPageViews / periodDays),
        timeRange,
        periodDays,
        recentSessions: [], // Not yet tracked
        viewsByDay: [], // Not yet tracked
        engagementBreakdown: [
          { name: 'high', value: Math.floor(totalPageViews * 0.3) },
          { name: 'medium', value: Math.floor(totalPageViews * 0.5) },
          { name: 'low', value: Math.floor(totalPageViews * 0.2) }
        ],
        recentConnections
      }
    });

  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
}
