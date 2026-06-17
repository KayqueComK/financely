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
