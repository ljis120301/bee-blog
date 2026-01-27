'use server';

/**
 * Comment Server Actions
 * ======================
 * 
 * Next.js 16 Server Actions for comment operations.
 */

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createCommentSchema, validate, getFirstError } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

/**
 * Create Comment Server Action
 */
export async function createCommentAction(prevState, formData) {
    const rawData = {
        postId: formData.get('postId'),
        content: formData.get('content'),
        parentId: formData.get('parentId') || null,
    };

    // Validation
    const validation = validate(createCommentSchema, rawData);
    if (!validation.success) {
        return { success: false, error: getFirstError(validation.errors), errors: validation.errors };
    }

    const { postId, content, parentId } = validation.data;

    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be logged in to comment' };
        }

        // Verify post exists
        const post = await db.post.findUnique({
            where: { id: postId },
            select: { id: true },
        });

        if (!post) {
            return { success: false, error: 'Post not found' };
        }

        const comment = await db.comment.create({
            data: {
                content,
                postId,
                authorId: user.id,
                parentId,
                status: 'PUBLISHED', // Auto-publish authenticated user comments
            },
            include: {
                author: {
                    select: { id: true, username: true },
                },
            },
        });

        // Revalidate the post page to show new comment
        revalidatePath(`/blogposts/${postId}`);

        return {
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt.toISOString(),
                author: comment.author,
            },
        };
    } catch (error) {
        console.error('Create comment action error:', error);
        return { success: false, error: 'Failed to create comment. Please try again.' };
    }
}

/**
 * Delete Comment Server Action
 */
export async function deleteCommentAction(commentId) {
    if (!commentId) {
        return { success: false, error: 'Comment ID is required' };
    }

    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be logged in to delete a comment' };
        }

        const comment = await db.comment.findUnique({
            where: { id: commentId },
            select: { id: true, authorId: true, postId: true },
        });

        if (!comment) {
            return { success: false, error: 'Comment not found' };
        }

        // Only author, ADMIN, or AUTHOR role can delete
        const canDelete =
            comment.authorId === user.id ||
            user.role === 'ADMIN' ||
            user.role === 'AUTHOR';

        if (!canDelete) {
            return { success: false, error: 'You do not have permission to delete this comment' };
        }

        await db.comment.delete({
            where: { id: commentId },
        });

        // Revalidate the post page
        revalidatePath(`/blogposts/${comment.postId}`);

        return { success: true };
    } catch (error) {
        console.error('Delete comment action error:', error);
        return { success: false, error: 'Failed to delete comment. Please try again.' };
    }
}
