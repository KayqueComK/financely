import prisma from './src/lib/db';

async function main() {
  const result = await prisma.user.updateMany({
    where: { emailVerified: null },
    data: { emailVerified: new Date() }
  });
  console.log(`Updated ${result.count} users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
