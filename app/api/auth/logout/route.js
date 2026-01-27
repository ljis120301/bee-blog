/**
 * Logout API Route
 * POST /api/auth/logout
 */
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
    try {
        await destroySession();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        );
    }
}
