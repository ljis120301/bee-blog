/**
 * Favorites API Routes
 * GET /api/favorites - Get user's favorites
 * POST /api/favorites - Add a favorite
 * DELETE /api/favorites - Remove a favorite
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: true, favorites: [] });
        }

        const favorites = await db.favorite.findMany({
            where: { userId: user.id },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        description: true,
                        heroImageUrl: true,
                        createdAt: true,
                        views: true,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            favorites: favorites.map(f => ({
                id: `${f.userId}-${f.postId}`,
                postId: f.postId,
                post: f.post,
                createdAt: f.createdAt,
            }))
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get favorites' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { postId } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { success: false, error: 'Post ID required' },
                { status: 400 }
            );
        }

        // Check if already favorited
        const existing = await db.favorite.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: postId,
                }
            }
        });

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already favorited' });
        }

        await db.favorite.create({
            data: {
                userId: user.id,
                postId: postId,
            }
        });

        return NextResponse.json({ success: true, message: 'Favorite added' });
    } catch (error) {
        console.error('Add favorite error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add favorite' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { postId } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { success: false, error: 'Post ID required' },
                { status: 400 }
            );
        }

        await db.favorite.deleteMany({
            where: {
                userId: user.id,
                postId: postId,
            }
        });

        return NextResponse.json({ success: true, message: 'Favorite removed' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove favorite' },
            { status: 500 }
        );
    }
}
