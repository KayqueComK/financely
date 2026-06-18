const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding default Administrator...");
  const adminEmail = "admin@financely.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin account already exists!");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: "Admin Financely",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const defaultCategories = [
      { name: "Alimentação", color: "#EF4444" },
      { name: "Salário", color: "#10B981" },
      { name: "Transporte", color: "#3B82F6" },
      { name: "Lazer", color: "#F59E0B" },
      { name: "Investimentos", color: "#8B5CF6" },
      { name: "Outros", color: "#64748B" },
    ];

    await tx.category.createMany({
      data: defaultCategories.map((cat) => ({
        name: cat.name,
        color: cat.color,
        userId: user.id,
      })),
    });

    console.log("Created Administrator Account!");
    console.log("Email: " + user.email);
    console.log("Password: admin123");
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
