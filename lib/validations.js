/**
 * Validation Schemas - Zod-based input validation
 * ================================================
 * 
 * Centralized validation schemas following Next.js 16 best practices.
 * Used by Server Actions and API routes.
 */

import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
});

export const registerSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    username: z
        .string({ required_error: 'Username is required' })
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
});

export const changePasswordSchema = z.object({
    oldPassword: z
        .string({ required_error: 'Current password is required' })
        .min(1, 'Current password is required'),
    newPassword: z
        .string({ required_error: 'New password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// ============================================================================
// POST SCHEMAS
// ============================================================================

export const createPostSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    content: z
        .string({ required_error: 'Content is required' })
        .min(1, 'Content is required'),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
        .optional(),
    description: z.string().max(500).nullable().optional(),
    dek: z.string().max(300).nullable().optional(),
    heroImageUrl: z.string().url().nullable().optional(),
    seoTitle: z.string().max(70).nullable().optional(),
    seoDescription: z.string().max(160).nullable().optional(),
    seoKeywords: z.array(z.string()).nullable().optional(),
    isSpanTwo: z.boolean().optional().default(false),
    readingTimeMinutes: z.number().int().positive().nullable().optional(),
    published: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial().extend({
    id: z.string({ required_error: 'Post ID is required' }),
});

// ============================================================================
// COMMENT SCHEMAS
// ============================================================================

export const createCommentSchema = z.object({
    postId: z.string({ required_error: 'Post ID is required' }),
    content: z
        .string({ required_error: 'Comment content is required' })
        .min(3, 'Comment must be at least 3 characters')
        .max(2000, 'Comment must be less than 2000 characters')
        .trim(),
    parentId: z.string().nullable().optional(),
});

// ============================================================================
// USER PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
        .optional(),
    name: z.string().max(100).nullable().optional(),
    email: z.string().email('Invalid email format').optional(),
});

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const updateUserRoleSchema = z.object({
    userId: z.string({ required_error: 'User ID is required' }),
    role: z.enum(['USER', 'AUTHOR', 'ADMIN'], {
        errorMap: () => ({ message: 'Role must be USER, AUTHOR, or ADMIN' }),
    }),
});

export const updateCommentStatusSchema = z.object({
    commentId: z.string({ required_error: 'Comment ID is required' }),
    status: z.enum(['published', 'pending', 'hidden', 'deleted'], {
        errorMap: () => ({ message: 'Invalid status' }),
    }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate data against a schema and return typed result
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {unknown} data - Data to validate
 * @returns {{ success: true, data: T } | { success: false, errors: Record<string, string> }}
 */
export function validate(schema, data) {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Convert Zod errors to a simple object
    const errors = {};
    result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });

    return { success: false, errors };
}

/**
 * Get first error message from validation result
 */
export function getFirstError(errors) {
    return Object.values(errors)[0] || 'Validation failed';
}
