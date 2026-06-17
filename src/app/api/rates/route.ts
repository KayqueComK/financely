import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://economia.api.uol.com.br/last/USD-BRL,EUR-BRL", {
      next: { revalidate: 300 }, // Cache rates for 5 minutes
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
    // Fallback static values in case the external API is down or unreachable
    return NextResponse.json({
      USDBRL: 5.40,
      EURBRL: 5.80,
      fallback: true,
    });
  }
}
