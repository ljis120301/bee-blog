/**
 * Ensure Admin Script
 * ====================
 * This script runs during container startup to guarantee the ADMIN_EMAIL
 * user exists with ADMIN role, verified email, and a working password.
 * 
 * Better Auth password hash format: s:<salt_base64>:<hash_base64>
 * - Uses scrypt with 64-byte key length
 * - Password is normalized with NFKC
 * 
 * Run with: node scripts/ensure-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { scrypt } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

const prisma = new PrismaClient();

/**
 * Hash password using Better Auth's EXACT format
 * From: https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/crypto/password.ts
 * Format: s:<salt_base64>:<hash_base64>
 */
async function hashPasswordBetterAuth(password) {
    const salt = crypto.randomBytes(16);
    const normalizedPassword = password.normalize('NFKC');
    const derivedKey = await scryptAsync(normalizedPassword, salt, 64);
    return `s:${salt.toString('base64')}:${derivedKey.toString('base64')}`;
}

async function ensureAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail) {
        console.log('[ENSURE-ADMIN] No ADMIN_EMAIL configured. Skipping.');
        return;
    }

    if (!adminPassword) {
        console.log('[ENSURE-ADMIN] No ADMIN_PASSWORD configured. Admin user will not have a password.');
        return;
    }

    console.log(`[ENSURE-ADMIN] Checking for admin user: ${adminEmail}`);

    try {
        // Hash the password using Better Auth's exact format
        const passwordHash = await hashPasswordBetterAuth(adminPassword);
        console.log(`[ENSURE-ADMIN] Generated hash prefix: ${passwordHash.substring(0, 20)}...`);

        // Find or create the user
        let user = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (user) {
            // Update user to ensure ADMIN role and verified email
            if (user.role !== 'ADMIN' || !user.emailVerified) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        role: 'ADMIN',
                        emailVerified: true,
                    },
                });
                console.log(`[ENSURE-ADMIN] Updated ${adminEmail} to ADMIN with verified email.`);
            }
        } else {
            // Create the user
            user = await prisma.user.create({
                data: {
                    email: adminEmail,
                    role: 'ADMIN',
                    emailVerified: true,
                    name: 'Admin',
                },
            });
            console.log(`[ENSURE-ADMIN] Created new ADMIN user: ${adminEmail}`);
        }

        // Delete any existing credential accounts to ensure fresh password
        const deletedAccounts = await prisma.account.deleteMany({
            where: {
                userId: user.id,
                providerId: 'credential',
            },
        });
        if (deletedAccounts.count > 0) {
            console.log(`[ENSURE-ADMIN] Deleted ${deletedAccounts.count} old credential account(s)`);
        }

        // Create fresh credential account entry
        await prisma.account.create({
            data: {
                id: crypto.randomUUID(),
                userId: user.id,
                providerId: 'credential',
                accountId: user.id,
                password: passwordHash,
            },
        });
        console.log(`[ENSURE-ADMIN] Created fresh credential account for ${adminEmail}`);

        console.log(`[ENSURE-ADMIN] ✅ Admin user fully configured: ${adminEmail}`);
    } catch (error) {
        console.error('[ENSURE-ADMIN] Error:', error.message);
        console.error('[ENSURE-ADMIN] Stack:', error.stack);
        // Don't throw - allow the app to start even if this fails
    } finally {
        await prisma.$disconnect();
    }
}

ensureAdmin();
