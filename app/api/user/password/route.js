/**
 * Change Password API Route
 * PUT /api/user/password - Change user password
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, getSession, invalidateOtherSessions } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function PUT(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { oldPassword, newPassword, confirmPassword } = await request.json();

        if (!oldPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, error: "New passwords don't match" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Get user with password hash
        const dbUser = await db.user.findUnique({
            where: { id: user.id }
        });

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify old password
        const isValid = await bcrypt.compare(oldPassword, dbUser.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash new password and update
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        await db.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash }
        });

        // Invalidate all other sessions (log out other devices)
        const currentSession = await getSession();
        if (currentSession?.token) {
            await invalidateOtherSessions(user.id, currentSession.token);
        }

        return NextResponse.json({ success: true, message: 'Password changed successfully. Other devices have been logged out.' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
