/**
 * Admin Setup API Route
 * POST /api/auth/setup
 * 
 * First-time admin account creation protected by ADMIN_SETUP_KEY.
 * Only works if no admin exists yet.
 */
import { NextResponse } from 'next/server';
import { setupAdmin, createSession } from '@/lib/auth';

export async function POST(request) {
    try {
        const { setupKey, email, username, password } = await request.json();

        if (!setupKey || !email || !username || !password) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const user = await setupAdmin(setupKey, email, username, password);

        // Auto-login after setup
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await createSession(user.id, ipAddress, userAgent);

        return NextResponse.json({
            success: true,
            message: 'Admin account created successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Admin setup error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Setup failed' },
            { status: 400 }
        );
    }
}
