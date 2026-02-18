/**
 * Ensure Admin Script
 * ====================
 * This script runs during container startup (after prisma migrate deploy).
 * It GUARANTEES admin access by creating or updating the admin user.
 *
 * Environment Variables (REQUIRED):
 *   ADMIN_EMAIL    - The admin email address
 *   ADMIN_PASSWORD - The admin password (will be hashed with scrypt, matching Better Auth)
 *
 * What it does:
 *   1. If no user exists with ADMIN_EMAIL → creates user + credential account
 *   2. If user exists → resets password, ensures ADMIN role, ensures emailVerified
 *   3. Always ensures a "credential" account entry exists with the current password
 *
 * This means you can NEVER be locked out. Every container restart re-ensures access.
 *
 * Run with: node scripts/ensure-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

const prisma = new PrismaClient();

/**
 * Hash a password using scrypt — the same way Better Auth does it.
 * Format: salt:hash (both hex-encoded)
 */
async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Generate a cuid-like ID for new records.
 * Better Auth / Prisma uses cuid() by default.
 */
function generateId() {
    return randomBytes(16).toString('hex');
}

async function ensureAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.log('[ENSURE-ADMIN] ⚠️  ADMIN_EMAIL and ADMIN_PASSWORD are both required. Skipping.');
        console.log('[ENSURE-ADMIN]    Set both environment variables in docker-compose.yml');
        return;
    }

    console.log(`[ENSURE-ADMIN] Ensuring admin account for: ${adminEmail}`);

    try {
        const hashedPassword = await hashPassword(adminPassword);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            console.log(`[ENSURE-ADMIN] User ${adminEmail} already exists (id: ${existingUser.id})`);

            // Ensure role is ADMIN and email is verified
            if (existingUser.role !== 'ADMIN' || !existingUser.emailVerified) {
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        role: 'ADMIN',
                        emailVerified: true,
                    },
                });
                console.log('[ENSURE-ADMIN] ✅ Updated user: role=ADMIN, emailVerified=true');
            }

            // Find or create the credential account (Better Auth stores passwords here)
            const existingAccount = await prisma.account.findFirst({
                where: {
                    userId: existingUser.id,
                    providerId: 'credential',
                },
            });

            if (existingAccount) {
                // Update password on the credential account
                await prisma.account.update({
                    where: { id: existingAccount.id },
                    data: { password: hashedPassword },
                });
                console.log('[ENSURE-ADMIN] ✅ Password reset on existing credential account');
            } else {
                // Create credential account (user might have only had OAuth before)
                const accountId = generateId();
                await prisma.account.create({
                    data: {
                        id: accountId,
                        accountId: existingUser.id,
                        providerId: 'credential',
                        userId: existingUser.id,
                        password: hashedPassword,
                    },
                });
                console.log('[ENSURE-ADMIN] ✅ Created new credential account for existing user');
            }
        } else {
            // Create user from scratch
            const userId = generateId();
            console.log(`[ENSURE-ADMIN] Creating new admin user (id: ${userId})`);

            await prisma.user.create({
                data: {
                    id: userId,
                    email: adminEmail,
                    name: 'Admin',
                    role: 'ADMIN',
                    emailVerified: true,
                },
            });

            // Create the credential account (this is how Better Auth stores email/password)
            const accountId = generateId();
            await prisma.account.create({
                data: {
                    id: accountId,
                    accountId: userId,
                    providerId: 'credential',
                    userId: userId,
                    password: hashedPassword,
                },
            });

            console.log('[ENSURE-ADMIN] ✅ Admin user and credential account created successfully');
        }

        // Clear any stale sessions for this user (force fresh login)
        const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (adminUser) {
            const deletedSessions = await prisma.session.deleteMany({
                where: { userId: adminUser.id },
            });
            if (deletedSessions.count > 0) {
                console.log(`[ENSURE-ADMIN] 🧹 Cleared ${deletedSessions.count} stale session(s)`);
            }
        }

        console.log('[ENSURE-ADMIN] ✅ Admin account is ready. You can login with your ADMIN_EMAIL and ADMIN_PASSWORD.');

    } catch (error) {
        console.error('[ENSURE-ADMIN] ❌ Error:', error.message);
        console.error(error);
        // Don't exit with error — we don't want to prevent the app from starting
    } finally {
        await prisma.$disconnect();
    }
}

ensureAdmin();
