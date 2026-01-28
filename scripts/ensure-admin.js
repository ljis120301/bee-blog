/**
 * Ensure Admin Script
 * ====================
 * This script runs during container startup.
 * 
 * Environment Variables:
 * - ADMIN_EMAIL: The email that should have ADMIN role
 * - CLEAR_ADMIN_USER: Set to "true" to delete the admin user (one-time cleanup)
 * 
 * Run with: node scripts/ensure-admin.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const shouldClearAdmin = process.env.CLEAR_ADMIN_USER === 'true';

    if (!adminEmail) {
        console.log('[ENSURE-ADMIN] No ADMIN_EMAIL configured. Skipping.');
        return;
    }

    console.log(`[ENSURE-ADMIN] Admin email: ${adminEmail}`);

    try {
        // One-time cleanup mode: delete the admin user so they can register fresh
        if (shouldClearAdmin) {
            console.log('[ENSURE-ADMIN] CLEAR_ADMIN_USER=true - Deleting admin user...');

            const user = await prisma.user.findUnique({
                where: { email: adminEmail },
            });

            if (user) {
                // Delete associated records first
                await prisma.account.deleteMany({ where: { userId: user.id } });
                await prisma.session.deleteMany({ where: { userId: user.id } });
                await prisma.user.delete({ where: { id: user.id } });
                console.log(`[ENSURE-ADMIN] ✅ Deleted user ${adminEmail} and all associated data.`);
                console.log('[ENSURE-ADMIN] ⚠️  REMOVE CLEAR_ADMIN_USER env var before next restart!');
            } else {
                console.log(`[ENSURE-ADMIN] User ${adminEmail} not found. Nothing to delete.`);
            }
            return;
        }

        // Normal mode: just ensure admin role
        const user = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (user) {
            if (user.role !== 'ADMIN' || !user.emailVerified) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'ADMIN', emailVerified: true },
                });
                console.log(`[ENSURE-ADMIN] ✅ Promoted ${adminEmail} to ADMIN role.`);
            } else {
                console.log(`[ENSURE-ADMIN] ✅ ${adminEmail} already has ADMIN role.`);
            }
        } else {
            console.log(`[ENSURE-ADMIN] User ${adminEmail} not found. Will be promoted on signup.`);
        }
    } catch (error) {
        console.error('[ENSURE-ADMIN] Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

ensureAdmin();
