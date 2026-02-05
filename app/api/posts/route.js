/**
 * Posts API Route
 * GET /api/posts - List published posts (public)
 * POST /api/posts - Create new post (AUTHOR/ADMIN only)
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const tag = url.searchParams.get('tag');
        const slotsPerPage = parseInt(url.searchParams.get('slots') || '9'); // 3 cols × 3 rows = 9 slots

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

        // Fetch all posts to calculate slot-based pagination
        const allPosts = await db.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                tags: {
                    include: { tag: true },
                },
            },
        });

        // Calculate page boundaries based on slots
        // Each post with isSpanTwo takes 2 slots, otherwise 1 slot
        let currentPage = 1;
        let currentSlots = 0;
        const pageStartIndices = [0]; // Index where each page starts

        for (let i = 0; i < allPosts.length; i++) {
            const slots = allPosts[i].isSpanTwo ? 2 : 1;

            // Check if adding this post would exceed the slot limit
            if (currentSlots + slots > slotsPerPage && currentSlots > 0) {
                // Start a new page
                currentPage++;
                pageStartIndices.push(i);
                currentSlots = slots;
            } else {
                currentSlots += slots;
            }
        }

        const totalPages = currentPage;

        // Get posts for the requested page
        const startIndex = pageStartIndices[page - 1] ?? 0;
        const endIndex = pageStartIndices[page] ?? allPosts.length;
        const pagePosts = allPosts.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            posts: pagePosts.map(post => ({
                ...post,
                tags: post.tags.map(pt => pt.tag),
            })),
            pagination: {
                page,
                slotsPerPage,
                total: allPosts.length,
                pages: totalPages,
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
