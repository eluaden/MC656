import { NextRequest, NextResponse } from "next/server";

type SoilLayer = {
  name?: string;
  depths?: Array<{
    label?: string;
    values?: {
      mean?: number | null;
    };
  }>;
};

type SoilResponse = {
  properties?: {
    layers?: SoilLayer[];
  };
};

function getLayerMean(data: SoilResponse, layerName: string) {
  const layer = data?.properties?.layers?.find((l) => l.name === layerName);
  return layer?.depths?.[0]?.values?.mean ?? null;
}

function hasUsefulSoilData(data: SoilResponse) {
  const clay = getLayerMean(data, "clay");
  const sand = getLayerMean(data, "sand");
  const silt = getLayerMean(data, "silt");
  const ph = getLayerMean(data, "phh2o");
  const soc = getLayerMean(data, "soc");

  return [clay, sand, silt, ph, soc].some((v) => v !== null && v !== undefined);
}

function buildSoilSummary(data: SoilResponse) {
  const clay = getLayerMean(data, "clay");
  const sand = getLayerMean(data, "sand");
  const silt = getLayerMean(data, "silt");
  const ph = getLayerMean(data, "phh2o");
  const soc = getLayerMean(data, "soc");

  const parts: string[] = [];

  if (ph !== null) parts.push(`pH aproximado: ${ph / 10}`);
  if (clay !== null) parts.push(`Argila: ${clay / 10}%`);
  if (sand !== null) parts.push(`Areia: ${sand / 10}%`);
  if (silt !== null) parts.push(`Silte: ${silt / 10}%`);
  if (soc !== null) parts.push(`Carbono orgânico: ${soc / 10} g/kg`);

  return {
    clay,
    sand,
    silt,
    ph,
    organicCarbon: soc,
    soilSummary:
      parts.length > 0
        ? parts.join(" | ")
        : "Sem dados de solo nesse ponto exato.",
  };
}

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