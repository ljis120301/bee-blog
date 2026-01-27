/**
 * Templates API
 * =============
 * CRUD operations for editor templates
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/templates - List all templates
export async function GET() {
    try {
        const templates = await db.template.findMany({
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

// POST /api/templates - Create new template (admin only)
export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, content } = body;

        if (!name || !content) {
            return NextResponse.json(
                { error: 'Name and content are required' },
                { status: 400 }
            );
        }

        const template = await db.template.create({
            data: { name, content },
        });

        return NextResponse.json({ template }, { status: 201 });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}
