/**
 * Admin Users API Routes
 * GET /api/admin/users - Get all users (admin only)
 * PUT /api/admin/users - Update user role (with safeguards)
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { updateUserRoleSchema, validate, getFirstError } from '@/lib/validations';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const users = await db.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get users' },
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

        const body = await request.json();

        // Zod validation
        const validation = validate(updateUserRoleSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: getFirstError(validation.errors), errors: validation.errors },
                { status: 400 }
            );
        }

        const { userId, role } = validation.data;

        // Get target user
        const targetUser = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, username: true },
        });

        if (!targetUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent self-demotion (admin can't remove their own admin status)
        if (userId === user.id && role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Cannot remove your own admin privileges. Ask another admin to make this change.' },
                { status: 400 }
            );
        }

        // Prevent removing the last admin
        if (targetUser.role === 'ADMIN' && role !== 'ADMIN') {
            const adminCount = await db.user.count({
                where: { role: 'ADMIN' },
            });

            if (adminCount <= 1) {
                return NextResponse.json(
                    { success: false, error: 'Cannot remove the last admin. Promote another user to admin first.' },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            }
        });

        // Log the role change (simple console log for now, can be replaced with audit table)
        console.log(`[AUDIT] Role change: ${targetUser.username} (${userId}) ${targetUser.role} -> ${role} by ${user.username} (${user.id})`);

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}

