import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency"); // e.g. "USD-BRL" or "EUR-BRL"
    const range = searchParams.get("range"); // "1d", "1w", "1m", "1y"

    if (!currency) {
      return NextResponse.json({ error: "Currency parameter is required" }, { status: 400 });
    }

    let url = "";
    
    // AwesomeAPI historical endpoints mapping
    switch (range) {
      case "1d":
        // Last 100 quotes for intraday variations
        url = `https://economia.awesomeapi.com.br/json/${currency}/100`;
        break;
      case "1w":
        // Last 7 days
        url = `https://economia.awesomeapi.com.br/json/daily/${currency}/7`;
        break;
      case "1m":
        // Last 30 days
        url = `https://economia.awesomeapi.com.br/json/daily/${currency}/30`;
        break;
      case "1y":
        // Last 360 days
        url = `https://economia.awesomeapi.com.br/json/daily/${currency}/360`;
        break;
      default:
        // Default to 1 day if not provided or invalid
        url = `https://economia.awesomeapi.com.br/json/${currency}/100`;
    }

    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch history from AwesomeAPI: ${res.status}`);
    }

    const data = await res.json();
    
    // Reverse the data so it's chronologically ordered (oldest to newest)
    const reversedData = Array.isArray(data) ? [...data].reverse() : [];
    
    // Format the response for the Recharts graph
    const formattedData = reversedData.map((item: any) => ({
      timestamp: parseInt(item.timestamp, 10) * 1000,
      date: new Date(parseInt(item.timestamp, 10) * 1000).toISOString(),
      bid: parseFloat(item.bid),
      ask: parseFloat(item.ask),
      high: parseFloat(item.high),
      low: parseFloat(item.low)
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("Rates History API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 });
  }
}
