import { NextResponse } from "next/server";

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

function buildClimateSummary(current: any) {
  if (!current) return "Sem dados climáticos disponíveis.";

  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const code = current.weather_code;

  const condition = weatherCodeToText(code);

  return `${condition}. Temperatura de ${temp}°C, umidade de ${humidity}% e vento de ${wind} km/h.`;
}

function weatherCodeToText(code: number) {
  const map: Record<number, string> = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa intensa",
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    71: "Neve fraca",
    73: "Neve moderada",
    75: "Neve forte",
    80: "Pancadas de chuva fracas",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    95: "Tempestade",
  };

  return map[code] ?? "Condição climática variável";
}