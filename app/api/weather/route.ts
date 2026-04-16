import { NextResponse } from "next/server";
import { buildClimateSummary } from "./weather-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude e longitude são obrigatórias." },
        { status: 400 }
      );
    }

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}` +
      `&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code` +
      `&timezone=auto`;

    const response = await fetch(url, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao consultar a API de clima." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const current = data.current;

    const summary = buildClimateSummary(current);

    return NextResponse.json({
      ok: true,
      climateSummary: summary,
      raw: current,
    });
  } catch {
    return NextResponse.json(
      { error: "Falha interna ao buscar clima." },
      { status: 500 }
    );
  }
}