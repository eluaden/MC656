import { buildClimateSummary, weatherCodeToText } from "./weather-utils";

describe("weatherCodeToText", () => {
  it("returns correct text for known weather codes", () => {
    expect(weatherCodeToText(0)).toBe("Céu limpo");
    expect(weatherCodeToText(3)).toBe("Nublado");
    expect(weatherCodeToText(61)).toBe("Chuva fraca");
    expect(weatherCodeToText(95)).toBe("Tempestade");
  });

  it("returns fallback for unknown weather codes", () => {
    expect(weatherCodeToText(999)).toBe("Condição climática variável");
    expect(weatherCodeToText(-1)).toBe("Condição climática variável");
  });

  it("maps all snow codes correctly", () => {
    expect(weatherCodeToText(71)).toBe("Neve fraca");
    expect(weatherCodeToText(73)).toBe("Neve moderada");
    expect(weatherCodeToText(75)).toBe("Neve forte");
  });

  it("maps all drizzle codes correctly", () => {
    expect(weatherCodeToText(51)).toBe("Garoa leve");
    expect(weatherCodeToText(53)).toBe("Garoa moderada");
    expect(weatherCodeToText(55)).toBe("Garoa intensa");
  });
});

describe("buildClimateSummary", () => {
  it("builds a complete climate summary", () => {
    const current = {
      temperature_2m: 25,
      relative_humidity_2m: 60,
      wind_speed_10m: 15,
      weather_code: 0,
    };
    const result = buildClimateSummary(current);

    expect(result).toBe("Céu limpo. Temperatura de 25°C, umidade de 60% e vento de 15 km/h.");
  });

  it("includes the correct weather condition text", () => {
    const current = {
      temperature_2m: 10,
      relative_humidity_2m: 90,
      wind_speed_10m: 30,
      weather_code: 65,
    };
    const result = buildClimateSummary(current);

    expect(result).toContain("Chuva forte");
    expect(result).toContain("10°C");
    expect(result).toContain("90%");
    expect(result).toContain("30 km/h");
  });

  it("handles decimal temperature values", () => {
    const current = {
      temperature_2m: 18.5,
      relative_humidity_2m: 72,
      wind_speed_10m: 8.3,
      weather_code: 2,
    };
    const result = buildClimateSummary(current);

    expect(result).toContain("18.5°C");
    expect(result).toContain("8.3 km/h");
  });

  it("uses fallback for unknown weather codes in summary", () => {
    const current = {
      temperature_2m: 20,
      relative_humidity_2m: 50,
      wind_speed_10m: 5,
      weather_code: 999,
    };
    const result = buildClimateSummary(current);

    expect(result).toContain("Condição climática variável");
  });
});
