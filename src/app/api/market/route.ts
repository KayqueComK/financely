import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get("tickers");
  const range = searchParams.get("range");
  const interval = searchParams.get("interval");

  if (!tickers) {
    return NextResponse.json({ error: "Parâmetro 'tickers' é obrigatório" }, { status: 400 });
  }

  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Token da Brapi não configurado no servidor" }, { status: 500 });
  }

  try {
    let url = `https://brapi.dev/api/quote/${tickers}?token=${token}`;
    if (range) url += `&range=${range}`;
    if (interval) url += `&interval=${interval}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Erro na resposta da Brapi" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar cotações:", error);
    return NextResponse.json({ error: "Erro interno ao buscar cotações" }, { status: 500 });
  }
}
