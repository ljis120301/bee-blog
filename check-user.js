const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'jason@whoisjason.me' },
            include: {
                accounts: true,
                sessions: true
            }
        });

        console.log('User Record:', JSON.stringify(user, null, 2));

        if (!user) {
            console.log('No user found with that email.');
        } else {
            console.log('Email verified:', user.emailVerified);
            console.log('Accounts linked:', user.accounts.length);
            console.log('Account providers:', user.accounts.map(a => a.providerId));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
