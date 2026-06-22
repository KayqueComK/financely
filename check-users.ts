import prisma from './src/lib/db';

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, emailVerified: true }
  });
  console.log(users);
}

main().finally(() => prisma.$disconnect());
