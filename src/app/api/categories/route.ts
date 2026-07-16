import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    let categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Salário", color: "#10b981", userId },
        { name: "Alimentação", color: "#f59e0b", userId },
        { name: "Diversão", color: "#8b5cf6", userId },
        { name: "Transporte", color: "#3b82f6", userId },
        { name: "Moradia", color: "#6366f1", userId },
        { name: "Saúde", color: "#ec4899", userId },
      ];

      await prisma.category.createMany({
        data: defaultCategories,
      });

      categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ message: "Erro ao buscar categorias." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, color } = await req.json();

    if (!name || !color) {
      return NextResponse.json({ message: "Nome e cor são obrigatórios." }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        color,
        userId,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json({ message: "Erro ao criar categoria." }, { status: 500 });
  }
}
