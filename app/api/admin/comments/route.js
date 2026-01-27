/**
 * Admin Comments Moderation API
 * GET /api/admin/comments - Get pending/hidden comments
 * PUT /api/admin/comments - Update comment status
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const comments = await db.comment.findMany({
            where: {
                OR: [
                    { status: 'pending' },
                    { status: 'hidden' }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, username: true, email: true }
                },
                post: {
                    select: { id: true, title: true }
                }
            }
        });

        return NextResponse.json({ success: true, comments });
    } catch (error) {
        console.error('Get pending comments error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get comments' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { commentId, status } = await request.json();

        if (!commentId || !status) {
            return NextResponse.json(
                { success: false, error: 'Comment ID and status required' },
                { status: 400 }
            );
        }

        const validStatuses = ['published', 'pending', 'hidden', 'deleted'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        if (status === 'deleted') {
            await db.comment.delete({
                where: { id: commentId }
            });
            return NextResponse.json({ success: true, message: 'Comment deleted' });
        }

        const updatedComment = await db.comment.update({
            where: { id: commentId },
            data: { status }
        });

        return NextResponse.json({ success: true, comment: updatedComment });
    } catch (error) {
        console.error('Update comment status error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update comment status' },
            { status: 500 }
        );
    }
}
