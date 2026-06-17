import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json({ message: "Erro ao buscar transações." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { description, amount, type, date, categoryId } = await req.json();

    if (!description || amount === undefined || !type || !date || !categoryId) {
      return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type, // "INCOME" or "EXPENSE"
        date: new Date(date),
        userId,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Transaction create error:", error);
    return NextResponse.json({ message: "Erro ao criar transação." }, { status: 500 });
  }
}
