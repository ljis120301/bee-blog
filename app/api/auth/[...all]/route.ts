/**
 * Better Auth Route Handler
 * ==========================
 * 
 * Catch-all route for Better Auth endpoints.
 * Handles: /api/auth/*, including OAuth callbacks.
 */

import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
