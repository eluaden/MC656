import { OpenMeteoAdapter } from "./open-meteo-adapter";

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("OpenMeteoAdapter", () => {
  it("adapts an Open-Meteo response into the internal climate data", async () => {
    const current = {
      temperature_2m: 25,
      relative_humidity_2m: 60,
      wind_speed_10m: 15,
      weather_code: 0,
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ current }),
    });

    const adapter = new OpenMeteoAdapter();
    const result = await adapter.fetch({ lat: -23, lng: -46 });

    expect(result.ok).toBe(true);
    expect(result.climateSummary).toBe(
      "Céu limpo. Temperatura de 25°C, umidade de 60% e vento de 15 km/h.",
    );
    expect(result.raw).toEqual(current);
  });
});
