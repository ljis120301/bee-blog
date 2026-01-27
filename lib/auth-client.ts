/**
 * Better Auth Client Configuration
 * ==================================
 * 
 * React client for authentication.
 * Use this for client-side auth operations.
 */

import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
    plugins: [
        usernameClient(),
    ],
});

// Export commonly used hooks and methods
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
