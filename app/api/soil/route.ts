import { NextRequest, NextResponse } from "next/server";
import { SoilGridsAdapter } from "@/app/lib/datasources/soil-grids-adapter";

const soilAdapter = new SoilGridsAdapter();

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
    const data = await soilAdapter.fetch({ lat, lng });
    return NextResponse.json({ lat, lng, ...data });
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
