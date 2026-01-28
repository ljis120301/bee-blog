/**
 * Ensure Admin Script
 * ====================
 * This script runs during container startup to guarantee the ADMIN_EMAIL
 * user exists with ADMIN role, verified email, and a working password.
 * 
 * Better Auth stores email/password credentials in the Account table,
 * so we must create both a User and an Account entry.
 * 
 * Run with: node scripts/ensure-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

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
        // Hash the password for Better Auth (uses bcrypt)
        const passwordHash = await bcrypt.hash(adminPassword, 10);

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

        // Now handle the Account entry for password login
        // Better Auth uses providerId: 'credential' for email/password
        const existingAccount = await prisma.account.findFirst({
            where: {
                userId: user.id,
                providerId: 'credential',
            },
        });

        if (existingAccount) {
            // Update the password
            await prisma.account.update({
                where: { id: existingAccount.id },
                data: { password: passwordHash },
            });
            console.log(`[ENSURE-ADMIN] Updated password for ${adminEmail}`);
        } else {
            // Create credential account entry
            await prisma.account.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    providerId: 'credential',
                    accountId: user.id, // Better Auth typically uses the user ID
                    password: passwordHash,
                },
            });
            console.log(`[ENSURE-ADMIN] Created credential account for ${adminEmail}`);
        }

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
