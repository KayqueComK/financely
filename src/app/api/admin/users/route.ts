import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// GET: List all users (Only ADMIN)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Acesso negado. Apenas administradores." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPremium: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ message: "Erro ao buscar usuários." }, { status: 500 });
  }
}

// POST: Seed/Create default Admin account automatically for demonstration purposes
export async function POST() {
  try {
    const adminEmail = "admin@financely.com";
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Conta administradora padrão já existe." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name: "Admin Financely",
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      // Default categories for admin
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

      return user;
    });

    return NextResponse.json({
      message: "Conta administradora criada com sucesso!",
      email: adminUser.email,
      role: adminUser.role,
    }, { status: 201 });
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json({ message: "Erro ao criar conta administradora." }, { status: 500 });
  }
}
