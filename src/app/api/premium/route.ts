import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // In a real application, you would create a Stripe Checkout Session here.
    // For a local demo and GitHub portfolio, we provide a simulated gateway
    // that immediately toggles the premium status of the user, which is perfect for recruiters to test.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
    });

    return NextResponse.json({
      message: "Assinatura premium ativada com sucesso!",
      isPremium: updatedUser.isPremium,
    });
  } catch (error) {
    console.error("Premium activation error:", error);
    return NextResponse.json({ message: "Erro ao ativar assinatura premium." }, { status: 500 });
  }
}
