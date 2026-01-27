/**
 * User Profile API Route
 * PUT /api/user/profile - Update user profile
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { username, name, email } = await request.json();

        // Build update data - only include provided fields
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;

        // Check if username is taken by another user
        if (username && username !== user.username) {
            const existingUser = await db.user.findFirst({
                where: {
                    username,
                    NOT: { id: user.id }
                }
            });
            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Username already taken' },
                    { status: 400 }
                );
            }
        }

        // Check if email is taken by another user
        if (email && email !== user.email) {
            const existingUser = await db.user.findFirst({
                where: {
                    email,
                    NOT: { id: user.id }
                }
            });
            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await db.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
