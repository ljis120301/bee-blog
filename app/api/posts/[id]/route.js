/**
 * Single Post API Route
 * GET /api/posts/[id] - Get single post (public)
 * PATCH /api/posts/[id] - Update post (owner AUTHOR or ADMIN)
 * DELETE /api/posts/[id] - Delete post (ADMIN only)
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, canEditPost } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const post = await db.post.findUnique({
            where: { id },
            include: {
                tags: {
                    include: { tag: true },
                },
                comments: {
                    where: { status: 'PUBLISHED' },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        // Increment view count (fire and forget)
        db.post.update({
            where: { id },
            data: { views: { increment: 1 } },
        }).catch(() => { });

        return NextResponse.json({
            success: true,
            post: {
                ...post,
                tags: post.tags.map(pt => pt.tag),
                seoKeywords: post.seoKeywords ? JSON.parse(post.seoKeywords) : [],
            },
        });
    } catch (error) {
        console.error('Get post error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get post' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const post = await db.post.findUnique({ where: { id } });

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check permissions
        if (!(await canEditPost(post))) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        const data = await request.json();

        // Build update object with only provided fields
        const updateData = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.dek !== undefined) updateData.dek = data.dek;
        if (data.heroImageUrl !== undefined) updateData.heroImageUrl = data.heroImageUrl;
        if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
        if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
        if (data.seoKeywords !== undefined) updateData.seoKeywords = JSON.stringify(data.seoKeywords);
        if (data.isSpanTwo !== undefined) updateData.isSpanTwo = data.isSpanTwo;
        if (data.readingTimeMinutes !== undefined) updateData.readingTimeMinutes = data.readingTimeMinutes;
        if (data.published !== undefined) updateData.published = data.published;

        const updatedPost = await db.post.update({
            where: { id },
            data: updateData,
        });

        // Update tags if provided
        if (data.tags !== undefined) {
            // Remove existing tags
            await db.postTag.deleteMany({ where: { postId: id } });

            // Add new tags
            if (data.tags.length > 0) {
                await db.postTag.createMany({
                    data: data.tags.map(tagId => ({
                        postId: id,
                        tagId,
                    })),
                });
            }
        }

        return NextResponse.json({
            success: true,
            post: {
                id: updatedPost.id,
                slug: updatedPost.slug,
                title: updatedPost.title,
            },
        });
    } catch (error) {
        console.error('Update post error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update post' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        // Only ADMIN can delete posts
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        const post = await db.post.findUnique({ where: { id } });

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        await db.post.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Post deleted',
        });
    } catch (error) {
        console.error('Delete post error:', error.message, error.stack);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete post' },
            { status: 500 }
        );
    }
}
