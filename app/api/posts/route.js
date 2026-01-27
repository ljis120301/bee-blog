/**
 * Posts API Route
 * GET /api/posts - List published posts (public)
 * POST /api/posts - Create new post (AUTHOR/ADMIN only)
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const tag = url.searchParams.get('tag');
        const skip = (page - 1) * limit;

        const where = {
            published: true,
            ...(tag && {
                tags: {
                    some: {
                        tag: {
                            name: tag,
                        },
                    },
                },
            }),
        };

        const [posts, total] = await Promise.all([
            db.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    tags: {
                        include: { tag: true },
                    },
                },
            }),
            db.post.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            posts: posts.map(post => ({
                ...post,
                tags: post.tags.map(pt => pt.tag),
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('List posts error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list posts' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // Require AUTHOR or ADMIN role
        const user = await getCurrentUser();

        if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.content) {
            return NextResponse.json(
                { success: false, error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        const slug = data.slug || data.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Check for duplicate slug
        const existingPost = await db.post.findUnique({ where: { slug } });
        if (existingPost) {
            return NextResponse.json(
                { success: false, error: 'A post with this slug already exists' },
                { status: 400 }
            );
        }

        // Create the post
        const post = await db.post.create({
            data: {
                title: data.title,
                slug,
                content: data.content,
                description: data.description || null,
                dek: data.dek || null,
                heroImageUrl: data.heroImageUrl || null,
                seoTitle: data.seoTitle || data.title,
                seoDescription: data.seoDescription || data.description,
                seoKeywords: data.seoKeywords ? JSON.stringify(data.seoKeywords) : null,
                isSpanTwo: data.isSpanTwo || false,
                readingTimeMinutes: data.readingTimeMinutes || null,
                published: data.published !== false, // Default to true
                authorId: user.id,
            },
        });

        // Handle tags if provided
        if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
            await db.postTag.createMany({
                data: data.tags.map(tagId => ({
                    postId: post.id,
                    tagId,
                })),
            });
        }

        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                slug: post.slug,
                title: post.title,
            },
        });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create post' },
            { status: 500 }
        );
    }
}
