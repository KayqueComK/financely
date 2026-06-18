import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// PUT: Update user details (Only ADMIN)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Acesso negado. Apenas administradores." }, { status: 403 });
    }

    const { id } = await params;
    const { name, email, role, password } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email: email.toLowerCase(),
      role,
    };

    // If password is provided, hash it and update
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Usuário atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ message: "Erro ao atualizar usuário." }, { status: 500 });
  }
}

// DELETE: Delete user account (Only ADMIN)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Acesso negado. Apenas administradores." }, { status: 403 });
    }

    const { id } = await params;
    const adminId = (session.user as any).id;

    // Prevent deleting own admin account
    if (id === adminId) {
      return NextResponse.json({ message: "Você não pode excluir sua própria conta de administrador." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Conta de usuário excluída com sucesso!",
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ message: "Erro ao excluir usuário." }, { status: 500 });
  }
}
