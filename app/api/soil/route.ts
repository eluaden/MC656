import { NextRequest, NextResponse } from "next/server";
import { hasUsefulSoilData, buildSoilSummary } from "./soil-utils";
import type { SoilResponse } from "./soil-utils";

async function fetchSoil(lat: number, lng: number) {
  const params = new URLSearchParams();
  params.set("lon", String(lng));
  params.set("lat", String(lat));
  params.append("property", "clay");
  params.append("property", "sand");
  params.append("property", "silt");
  params.append("property", "phh2o");
  params.append("property", "soc");
  params.append("depth", "0-5cm");
  params.append("value", "mean");

  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Erro SoilGrids: ${response.status}`);
  }

  return response.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: "lat e lng são obrigatórios" },
      { status: 400 }
    );
  }

  const lat = Number(latParam);
  const lng = Number(lngParam);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat e lng precisam ser números válidos" },
      { status: 400 }
    );
  }

  try {
    const raw = await fetchSoil(lat, lng);

    return NextResponse.json({
      lat,
      lng,
      source: "SoilGrids",
      hasData: hasUsefulSoilData(raw),
      ...buildSoilSummary(raw),
      raw,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao consultar SoilGrids",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}