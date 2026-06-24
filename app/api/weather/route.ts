import { NextResponse } from "next/server";
import { OpenMeteoAdapter } from "@/app/lib/datasources/open-meteo-adapter";

const weatherAdapter = new OpenMeteoAdapter();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude e longitude são obrigatórias." },
      { status: 400 }
    );
  }

  try {
    const data = await weatherAdapter.fetch({ lat: Number(lat), lng: Number(lng) });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Falha ao buscar clima." },
      { status: 500 }
    );
  }
}
