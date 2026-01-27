/**
 * Tags API Route
 * GET /api/tags - List all tags (public)
 * POST /api/tags - Create new tag (AUTHOR/ADMIN only)
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const tags = await db.tag.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            success: true,
            tags,
        });
    } catch (error) {
        console.error('List tags error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list tags' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'AUTHOR' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, colorBg, colorText } = await request.json();

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Tag name is required' },
                { status: 400 }
            );
        }

        const normalizedName = name.trim().toLowerCase();

        // Check for duplicate
        const existing = await db.tag.findUnique({
            where: { name: normalizedName },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Tag already exists', tag: existing },
                { status: 400 }
            );
        }

        const tag = await db.tag.create({
            data: {
                name: normalizedName,
                colorBg: colorBg || '#ef9f76',
                colorText: colorText || '#303446',
            },
        });

        return NextResponse.json({
            success: true,
            tag,
        });
    } catch (error) {
        console.error('Create tag error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create tag' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { tagId } = await request.json();

        if (!tagId) {
            return NextResponse.json(
                { success: false, error: 'Tag ID is required' },
                { status: 400 }
            );
        }

        // Remove tag from all posts first
        await db.postTag.deleteMany({ where: { tagId } });

        // Delete the tag
        await db.tag.delete({ where: { id: tagId } });

        return NextResponse.json({
            success: true,
            message: 'Tag deleted',
        });
    } catch (error) {
        console.error('Delete tag error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete tag' },
            { status: 500 }
        );
    }
}
