import { NextResponse } from "next/server";
import { getLayerMean, type SoilResponse } from "../soil/soil-utils";
import {
  classifyTexture,
  recommendCrops,
  textureLabel,
  type CropConditions,
} from "./crop-utils";

async function fetchSoil(lat: number, lng: number): Promise<SoilResponse> {
  const params = new URLSearchParams();
  params.set("lon", String(lng));
  params.set("lat", String(lat));
  params.append("property", "clay");
  params.append("property", "sand");
  params.append("property", "silt");
  params.append("property", "phh2o");
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

async function fetchTemperature(
  lat: number,
  lng: number
): Promise<number | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lng}` +
    `&current=temperature_2m` +
    `&timezone=auto`;

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) return null;

  const data = await response.json();
  return data?.current?.temperature_2m ?? null;
}

export async function GET(req: Request) {
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
    const [soil, temperature] = await Promise.all([
      fetchSoil(lat, lng),
      fetchTemperature(lat, lng),
    ]);

    const ph = getLayerMean(soil, "phh2o");
    const clay = getLayerMean(soil, "clay");
    const sand = getLayerMean(soil, "sand");
    const silt = getLayerMean(soil, "silt");

    // SoilGrids retorna pH em pH*10 e as frações em g/kg (÷10 = %).
    const conditions: CropConditions = {
      ph: ph !== null ? ph / 10 : null,
      clayPct: clay !== null ? clay / 10 : null,
      sandPct: sand !== null ? sand / 10 : null,
      siltPct: silt !== null ? silt / 10 : null,
      temperature,
    };

    const texture = classifyTexture(conditions.clayPct, conditions.sandPct);
    const recommendations = recommendCrops(conditions);
    const hasData =
      conditions.ph !== null ||
      conditions.clayPct !== null ||
      conditions.temperature !== null;

    return NextResponse.json({
      lat,
      lng,
      hasData,
      texture,
      textureLabel: textureLabel(texture),
      conditions,
      recommendations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao gerar recomendação de cultura",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
