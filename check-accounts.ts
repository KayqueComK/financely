import prisma from './src/lib/db';

async function main() {
  const accounts = await prisma.account.findMany();
  console.log(accounts);
}

main().finally(() => prisma.$disconnect());
