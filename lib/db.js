/**
 * Prisma Database Client (Prisma 6.x)
 * ====================================
 * 
 * Singleton Prisma client for SQLite database.
 * Prisma 6.x has native SQLite support - no driver adapters needed.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Only initialize on server
let db;

if (typeof window === 'undefined') {
    if (globalForPrisma.prisma) {
        db = globalForPrisma.prisma;
    } else {
        db = new PrismaClient({
            log: process.env.NODE_ENV === 'development'
                ? ['error', 'warn']
                : ['error'],
        });

        console.log('✅ Prisma client initialized (v6.x with native SQLite)');

        // Prevent multiple instances in development
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = db;
        }
    }
}

export { db };
export default db;
