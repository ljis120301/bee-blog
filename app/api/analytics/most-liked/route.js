import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(10, Number(searchParams.get('limit')) || 5));

    // Fetch all favorites (bounded batch); aggregate by post id
    const favorites = await pb.collection('favorites').getFullList({
      expand: 'posts',
      '$autoCancel': false,
      batch: 200,
      fields: 'id,posts,expand.posts.title,expand.posts.created,expand.posts.views'
    });

    const postIdToStats = new Map();
    for (const fav of favorites) {
      const postId = typeof fav.posts === 'string' ? fav.posts : fav.posts?.id;
      if (!postId) continue;
      const expandPost = fav.expand?.posts;
      if (!postIdToStats.has(postId)) {
        postIdToStats.set(postId, {
          id: postId,
          title: expandPost?.title || 'Untitled',
          created: expandPost?.created || null,
          views: expandPost?.views || 0,
          likes: 0,
        });
      }
      postIdToStats.get(postId).likes += 1;
    }

    const ranked = Array.from(postIdToStats.values())
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);

    return NextResponse.json({ success: true, items: ranked });
  } catch (error) {
    console.error('most-liked error:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute most liked' }, { status: 500 });
  }
}


