/**
 * Next.js Instrumentation — Admin Account Ensure
 * =================================================
 * Runs once when the Next.js server starts.
 * Guarantees the admin account exists with the correct password.
 *
 * This runs INSIDE the Next.js process so module resolution
 * for better-auth/crypto matches exactly what the sign-in flow uses.
 */

export async function register() {
    // Only run on the server (not edge runtime)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await ensureAdmin();
    }
}

function randomId() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function ensureAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.log('[ENSURE-ADMIN] ⚠️  ADMIN_EMAIL and ADMIN_PASSWORD are both required. Skipping.');
        return;
    }

    console.log(`[ENSURE-ADMIN] Ensuring admin account for: ${adminEmail}`);

    try {
        // Dynamic imports to avoid issues during build
        const { hashPassword } = await import('better-auth/crypto');
        const { db } = await import('./lib/db.js');

        const hashedPassword = await hashPassword(adminPassword);
        console.log('[ENSURE-ADMIN] Password hashed with Better Auth crypto (in-process)');

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            console.log(`[ENSURE-ADMIN] User exists (id: ${existingUser.id})`);

            // Ensure role + emailVerified
            if (existingUser.role !== 'ADMIN' || !existingUser.emailVerified) {
                await db.user.update({
                    where: { id: existingUser.id },
                    data: { role: 'ADMIN', emailVerified: true },
                });
                console.log('[ENSURE-ADMIN] ✅ Updated: role=ADMIN, emailVerified=true');
            }

            // Find or create credential account
            const existingAccount = await db.account.findFirst({
                where: { userId: existingUser.id, providerId: 'credential' },
            });

            if (existingAccount) {
                await db.account.update({
                    where: { id: existingAccount.id },
                    data: { password: hashedPassword },
                });
                console.log('[ENSURE-ADMIN] ✅ Password reset on existing credential account');
            } else {
                await db.account.create({
                    data: {
                        id: randomId(),
                        accountId: existingUser.id,
                        providerId: 'credential',
                        userId: existingUser.id,
                        password: hashedPassword,
                    },
                });
                console.log('[ENSURE-ADMIN] ✅ Created credential account for existing user');
            }
        } else {
            // Create user + credential account from scratch
            const userId = randomId();

            await db.user.create({
                data: {
                    id: userId,
                    email: adminEmail,
                    name: 'Admin',
                    role: 'ADMIN',
                    emailVerified: true,
                },
            });

            await db.account.create({
                data: {
                    id: randomId(),
                    accountId: userId,
                    providerId: 'credential',
                    userId: userId,
                    password: hashedPassword,
                },
            });

            console.log('[ENSURE-ADMIN] ✅ Admin user + credential account created');
        }

        // Clear stale sessions
        const adminUser = await db.user.findUnique({ where: { email: adminEmail } });
        if (adminUser) {
            const deleted = await db.session.deleteMany({ where: { userId: adminUser.id } });
            if (deleted.count > 0) {
                console.log(`[ENSURE-ADMIN] 🧹 Cleared ${deleted.count} stale session(s)`);
            }
        }

        console.log('[ENSURE-ADMIN] ✅ Admin account ready.');
    } catch (error) {
        console.error('[ENSURE-ADMIN] ❌ Error:', error.message);
        console.error(error);
        // Don't throw — server should still start
    }
}
