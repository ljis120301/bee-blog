const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const deleted = await prisma.user.delete({
            where: { email: 'jason@whoisjason.me' },
        });
        console.log('Deleted user:', deleted.email);
    } catch (e) {
        if (e.code === 'P2025') {
            console.log('User not found, already deleted.');
        } else {
            console.error(e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
