/**
 * Most Liked Posts API
 * GET /api/analytics/most-liked - Returns posts ranked by number of favorites
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(10, Number(searchParams.get('limit')) || 5));

    // Get posts with their favorite counts using Prisma
    const postsWithFavorites = await db.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        createdAt: true,
        views: true,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: {
        favorites: { _count: 'desc' }
      },
      take: limit
    });

    // Transform to expected format
    const ranked = postsWithFavorites
      .filter(post => post._count.favorites > 0)
      .map(post => ({
        id: post.id,
        title: post.title,
        created: post.createdAt,
        views: post.views,
        likes: post._count.favorites
      }));

    return NextResponse.json({ success: true, items: ranked });
  } catch (error) {
    console.error('most-liked error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute most liked' },
      { status: 500 }
    );
  }
}
