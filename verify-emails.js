const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.updateMany({
    where: { emailVerified: null },
    data: { emailVerified: new Date() }
  });
  console.log(`Updated ${count.count} users to verified.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
