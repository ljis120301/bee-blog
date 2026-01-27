/**
 * Current User API Route
 * GET /api/auth/me
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, user: null },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get user' },
            { status: 500 }
        );
    }
}
