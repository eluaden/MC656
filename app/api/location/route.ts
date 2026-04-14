import { NextRequest, NextResponse } from "next/server";

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
};

type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

function pickCityName(address?: NominatimAddress | null) {
  if (!address) {
    return null;
  }

  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    null
  );
}

function buildLocationPayload(
  data: NominatimResponse | null,
  lat: number,
  lng: number,
) {
  if (!data) {
    return {
      cityName: null,
      state: null,
      country: null,
      locationLabel: `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`,
    };
  }

  const cityName = pickCityName(data.address);
  const state = data.address?.state ?? null;
  const country = data.address?.country ?? null;
  const parts = [cityName, state, country].filter(Boolean);

  return {
    cityName,
    state,
    country,
    locationLabel:
      parts.length > 0
        ? parts.join(", ")
        : (data.display_name ?? `Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`),
  };
}

async function fetchLocation(lat: number, lng: number) {
  const params = new URLSearchParams();
  params.set("format", "json");
  params.set("lat", String(lat));
  params.set("lon", String(lng));

  const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "mc656-academico/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erro Nominatim: ${response.status}`);
  }

  return (await response.json()) as NominatimResponse;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: "lat e lng são obrigatórios" },
      { status: 400 },
    );
  }

  const lat = Number(latParam);
  const lng = Number(lngParam);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "lat e lng precisam ser números válidos" },
      { status: 400 },
    );
  }

  try {
    const raw = await fetchLocation(lat, lng);

    return NextResponse.json({
      lat,
      lng,
      source: "Nominatim",
      ...buildLocationPayload(raw, lat, lng),
      raw,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao consultar Nominatim",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
