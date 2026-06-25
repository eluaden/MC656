import { DataSourceAdapter, GeoPoint } from "./types";
import { buildClimateSummary } from "@/app/api/weather/weather-utils";

type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
};

export type ClimateData = {
  ok: true;
  climateSummary: string;
  raw: CurrentWeather;
};

export class OpenMeteoAdapter implements DataSourceAdapter<ClimateData> {
  async fetch({ lat, lng }: GeoPoint): Promise<ClimateData> {
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
      throw new Error(`Erro Open-Meteo: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current as CurrentWeather;

    return {
      ok: true,
      climateSummary: buildClimateSummary(current),
      raw: current,
    };
  }
}
