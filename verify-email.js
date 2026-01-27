const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.update({
            where: { email: 'jason@whoisjason.me' },
            data: { emailVerified: true }
        });
        console.log('Manually verified email for:', user.email);
        console.log('New Verification Status:', user.emailVerified);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
