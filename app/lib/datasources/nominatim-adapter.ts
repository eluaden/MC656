import { DataSourceAdapter, GeoPoint } from "./types";
import {
  buildLocationPayload,
  type NominatimResponse,
} from "@/app/api/location/location-utils";

export type LocationData = {
  source: "Nominatim";
  cityName: string | null;
  state: string | null;
  country: string | null;
  locationLabel: string;
  raw: NominatimResponse;
};

export class NominatimAdapter implements DataSourceAdapter<LocationData> {
  async fetch({ lat, lng }: GeoPoint): Promise<LocationData> {
    const params = new URLSearchParams();
    params.set("format", "json");
    params.set("lat", String(lat));
    params.set("lon", String(lng));

    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "mc656-academico/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erro Nominatim: ${response.status}`);
    }

    const raw = (await response.json()) as NominatimResponse;

    return {
      source: "Nominatim",
      ...buildLocationPayload(raw, lat, lng),
      raw,
    };
  }
}
