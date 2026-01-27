/**
 * Comments API Routes
 * GET /api/comments?postId=xxx - Get comments for a post
 * POST /api/comments - Create a comment
 * DELETE /api/comments - Delete a comment
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        const page = Math.max(1, Number(searchParams.get('page')) || 1);
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
        const skip = (page - 1) * limit;

        if (!postId) {
            return NextResponse.json(
                { success: false, error: 'Post ID required' },
                { status: 400 }
            );
        }

        const user = await getCurrentUser();

        // Build where clause - show published + user's own pending
        const where = {
            postId,
            OR: [
                { status: 'published' },
                ...(user ? [{ authorId: user.id }] : [])
            ]
        };

        const [comments, total] = await Promise.all([
            db.comment.findMany({
                where,
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
                include: {
                    author: {
                        select: { id: true, username: true }
                    }
                }
            }),
            db.comment.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            comments,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get comments' },
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

        const { postId, content } = await request.json();

        if (!postId || !content?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Post ID and content required' },
                { status: 400 }
            );
        }

        const trimmed = content.trim();
        if (trimmed.length < 3) {
            return NextResponse.json(
                { success: false, error: 'Comment is too short' },
                { status: 400 }
            );
        }

        const comment = await db.comment.create({
            data: {
                postId,
                authorId: user.id,
                content: trimmed,
                status: 'published', // Auto-publish for now
            },
            include: {
                author: {
                    select: { id: true, username: true }
                }
            }
        });

        return NextResponse.json({ success: true, comment });
    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create comment' },
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

        const { commentId } = await request.json();

        if (!commentId) {
            return NextResponse.json(
                { success: false, error: 'Comment ID required' },
                { status: 400 }
            );
        }

        const comment = await db.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return NextResponse.json(
                { success: false, error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Only owner or admin/author can delete
        const isOwner = comment.authorId === user.id;
        const isModerator = user.role === 'ADMIN' || user.role === 'AUTHOR';

        if (!isOwner && !isModerator) {
            return NextResponse.json(
                { success: false, error: 'Not authorized to delete this comment' },
                { status: 403 }
            );
        }

        await db.comment.delete({
            where: { id: commentId }
        });

        return NextResponse.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
