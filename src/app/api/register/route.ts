import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Este e-mail já está em uso." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and default categories in a transaction
    const newUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name,
          email: emailLower,
          password: hashedPassword,
        },
      });

      // Default categories
      const defaultCategories = [
        { name: "Alimentação", color: "#EF4444" },    // Red
        { name: "Salário", color: "#10B981" },        // Emerald
        { name: "Transporte", color: "#3B82F6" },     // Blue
        { name: "Lazer", color: "#F59E0B" },          // Amber
        { name: "Investimentos", color: "#8B5CF6" },  // Violet
        { name: "Outros", color: "#64748B" },         // Slate
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

    return NextResponse.json(
      { message: "Usuário registrado com sucesso!", userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao processar o cadastro." },
      { status: 500 }
    );
  }
}
