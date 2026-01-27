'use server';

/**
 * Auth Server Actions
 * ===================
 * 
 * Next.js 16 Server Actions for authentication operations.
 * These replace traditional API routes for form submissions.
 */

import { authenticate, createSession, registerUser, destroySession, getSession, invalidateOtherSessions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    validate,
    getFirstError
} from '@/lib/validations';

// In-memory rate limiting for Server Actions
const loginAttempts = new Map();
const registerAttempts = new Map();

function checkRateLimit(map, key, maxAttempts, windowMs) {
    const now = Date.now();
    const data = map.get(key);

    if (!data || now - data.startTime > windowMs) {
        map.set(key, { count: 1, startTime: now });
        return { allowed: true };
    }

    if (data.count >= maxAttempts) {
        const resetTime = data.startTime + windowMs;
        return {
            allowed: false,
            retryAfter: Math.ceil((resetTime - now) / 1000)
        };
    }

    data.count++;
    return { allowed: true };
}

function getClientIP() {
    const headersList = headers();
    return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        'unknown';
}

/**
 * Login Server Action
 */
export async function loginAction(prevState, formData) {
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    // Rate limiting
    const ip = getClientIP();
    const rateCheck = checkRateLimit(loginAttempts, ip, 5, 15 * 60 * 1000);

    if (!rateCheck.allowed) {
        return {
            success: false,
            error: `Too many login attempts. Try again in ${rateCheck.retryAfter} seconds.`,
        };
    }

    // Validation
    const validation = validate(loginSchema, rawData);
    if (!validation.success) {
        return { success: false, error: getFirstError(validation.errors), errors: validation.errors };
    }

    const { email, password } = validation.data;

    try {
        const user = await authenticate(email, password);

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Reset rate limiter on success
        loginAttempts.delete(ip);

        // Get IP and user agent for session
        const headersList = headers();
        const ipAddress = ip;
        const userAgent = headersList.get('user-agent') || 'unknown';

        await createSession(user.id, ipAddress, userAgent);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role,
            },
        };
    } catch (error) {
        console.error('Login action error:', error);
        return { success: false, error: 'Login failed. Please try again.' };
    }
}

/**
 * Register Server Action
 */
export async function registerAction(prevState, formData) {
    const rawData = {
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password'),
        name: formData.get('name') || null,
        lastName: formData.get('lastName') || null,
    };

    // Rate limiting
    const ip = getClientIP();
    const rateCheck = checkRateLimit(registerAttempts, ip, 3, 60 * 60 * 1000);

    if (!rateCheck.allowed) {
        return {
            success: false,
            error: `Too many registration attempts. Try again in ${Math.ceil(rateCheck.retryAfter / 60)} minutes.`,
        };
    }

    // Validation
    const validation = validate(registerSchema, rawData);
    if (!validation.success) {
        return { success: false, error: getFirstError(validation.errors), errors: validation.errors };
    }

    try {
        const user = await registerUser(validation.data);

        // Auto-login after registration
        const headersList = headers();
        const ipAddress = ip;
        const userAgent = headersList.get('user-agent') || 'unknown';

        await createSession(user.id, ipAddress, userAgent);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role,
            },
        };
    } catch (error) {
        console.error('Registration action error:', error);

        if (error.code === 'P2002') {
            return { success: false, error: 'An account with this email or username already exists' };
        }

        return { success: false, error: 'Registration failed. Please try again.' };
    }
}

/**
 * Logout Server Action
 */
export async function logoutAction() {
    await destroySession();
    redirect('/');
}

/**
 * Change Password Server Action
 */
export async function changePasswordAction(prevState, formData) {
    const rawData = {
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
    };

    // Validation
    const validation = validate(changePasswordSchema, rawData);
    if (!validation.success) {
        return { success: false, error: getFirstError(validation.errors), errors: validation.errors };
    }

    const { oldPassword, newPassword } = validation.data;

    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: 'You must be logged in to change your password' };
        }

        const user = session.user;

        // Get full user with password hash
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
        });

        if (!dbUser) {
            return { success: false, error: 'User not found' };
        }

        // Verify old password
        const isValid = await bcrypt.compare(oldPassword, dbUser.passwordHash);
        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Hash and update new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        await db.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        });

        // Invalidate other sessions
        if (session.token) {
            await invalidateOtherSessions(user.id, session.token);
        }

        return { success: true, message: 'Password changed successfully. Other devices have been logged out.' };
    } catch (error) {
        console.error('Change password action error:', error);
        return { success: false, error: 'Failed to change password. Please try again.' };
    }
}
