/**
 * Ensure Admin Script
 * ====================
 * This script runs during container startup to guarantee the ADMIN_EMAIL
 * user exists with ADMIN role, verified email, and a password.
 * 
 * Run with: node scripts/ensure-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
    }

    console.log(`[ENSURE-ADMIN] Checking for admin user: ${adminEmail}`);

    try {
        // Hash the password if provided
        const passwordHash = adminPassword ? await bcrypt.hash(adminPassword, 10) : null;

        // Find existing user with this email
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            // User exists - check if they need updating
            const needsUpdate = existingUser.role !== 'ADMIN' ||
                !existingUser.emailVerified ||
                (passwordHash && !existingUser.passwordHash);

            if (needsUpdate) {
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        role: 'ADMIN',
                        emailVerified: true,
                        ...(passwordHash && { passwordHash }),
                    },
                });
                console.log(`[ENSURE-ADMIN] Updated ${adminEmail} to ADMIN with verified email and password.`);
            } else {
                console.log(`[ENSURE-ADMIN] ${adminEmail} is already fully configured as ADMIN.`);
            }
        } else {
            // User doesn't exist - create them with password
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    role: 'ADMIN',
                    emailVerified: true,
                    name: 'Admin',
                    passwordHash,
                },
            });
            console.log(`[ENSURE-ADMIN] Created new ADMIN user: ${adminEmail} with password.`);
        }
    } catch (error) {
        console.error('[ENSURE-ADMIN] Error:', error.message);
        // Don't throw - allow the app to start even if this fails
    } finally {
        await prisma.$disconnect();
    }
}

ensureAdmin();
