import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const resolvedParams = await params;
    const transactionId = resolvedParams.id;

    // Check if the transaction belongs to this user
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      return NextResponse.json({ message: "Transação não encontrada ou acesso negado." }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ message: "Transação excluída com sucesso!" });
  } catch (error) {
    console.error("Transaction delete error:", error);
    return NextResponse.json({ message: "Erro ao excluir transação." }, { status: 500 });
  }
}

// PUT: Update transaction
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const resolvedParams = await params;
    const transactionId = resolvedParams.id;
    const { description, amount, type, date, categoryId } = await req.json();

    if (!description || !amount || !type || !date || !categoryId) {
      return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    // Check if the transaction belongs to this user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      return NextResponse.json({ message: "Transação não encontrada ou acesso negado." }, { status: 404 });
    }

    // Update
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("Transaction update error:", error);
    return NextResponse.json({ message: "Erro ao atualizar transação." }, { status: 500 });
  }
}
