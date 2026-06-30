import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const { description, amount, type, categoryId, startDate } = body;

    if (!description || !amount || !type || !categoryId || !startDate) {
      return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });
    }

    // Create the subscription
    // The nextDueDate is initially set to the startDate
    const subscription = await prisma.subscription.create({
      data: {
        description,
        amount,
        type,
        startDate: new Date(startDate),
        nextDueDate: new Date(startDate),
        categoryId,
        userId: user.id,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar assinatura:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
