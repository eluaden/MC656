import { DataSourceAdapter, GeoPoint } from "./types";
import {
  hasUsefulSoilData,
  buildSoilSummary,
  type SoilResponse,
} from "@/app/api/soil/soil-utils";

export type SoilData = {
  source: "SoilGrids";
  hasData: boolean;
  clay: number | null;
  sand: number | null;
  silt: number | null;
  ph: number | null;
  organicCarbon: number | null;
  soilSummary: string;
  raw: SoilResponse;
};

export class SoilGridsAdapter implements DataSourceAdapter<SoilData> {
  async fetch({ lat, lng }: GeoPoint): Promise<SoilData> {
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

    const raw = (await response.json()) as SoilResponse;

    return {
      source: "SoilGrids",
      hasData: hasUsefulSoilData(raw),
      ...buildSoilSummary(raw),
      raw,
    };
  }
}
