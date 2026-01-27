'use client';

/**
 * Authentication Context for BeeBlog
 * ===================================
 * 
 * Provides authentication state and functions to the React component tree.
 * Now powered by Better Auth.
 */

import { createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession, signOut } from '@/lib/auth-client';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const { data: session, isPending: loading } = useSession();
    const router = useRouter();

    // Extract user from session
    const user = useMemo(() => {
        if (!session?.user) return null;
        return {
            id: session.user.id,
            email: session.user.email,
            username: session.user.username || session.user.displayUsername,
            name: session.user.name,
            role: session.user.role || 'USER',
            image: session.user.image,
        };
    }, [session]);

    // Login function (email/password)
    const login = async (email, password) => {
        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message || 'Login failed' };
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    };

    // Social login (Google)
    const loginWithGoogle = async (callbackURL = '/') => {
        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL,
            });
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: 'Google login failed' };
        }
    };

    // Logout function
    const logout = async () => {
        await signOut();
        router.push('/');
    };

    // Register function
    const register = async ({ email, username, password, name }) => {
        try {
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name: name || username,
                username,
            });

            if (error) {
                return { success: false, error: error.message || 'Registration failed' };
            }

            return { success: true, message: 'Please check your email to verify your account.' };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Registration failed' };
        }
    };

    // Role checks
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'ADMIN';
    const isAuthor = user?.role === 'AUTHOR' || user?.role === 'ADMIN';

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isAuthor,
        login,
        loginWithGoogle,
        logout,
        register,
        session,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
