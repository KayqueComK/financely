import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://economia.api.uol.com.br/last/USD-BRL,EUR-BRL", {
      next: { revalidate: 86400 }, // Cache rates for 24 hours (1 day)
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar dados na API externa");
    }

    const data = await res.json();
    return NextResponse.json({
      USDBRL: parseFloat(data.USDBRL.ask),
      EURBRL: parseFloat(data.EURBRL.ask),
    });
  } catch (error) {
    console.error("Rates API error:", error);
    // Fallback static values updated with the current rates
    return NextResponse.json({
      USDBRL: 5.09,
      EURBRL: 5.83,
      fallback: true,
    });
  }
}
