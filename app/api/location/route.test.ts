import { pickCityName, buildLocationPayload } from "./location-utils";

describe("pickCityName", () => {
  it("returns city when available", () => {
    expect(pickCityName({ city: "São Paulo" })).toBe("São Paulo");
  });

  it("falls back to town when city is not available", () => {
    expect(pickCityName({ town: "Campinas" })).toBe("Campinas");
  });

  it("falls back to village when city and town are missing", () => {
    expect(pickCityName({ village: "Monte Alegre" })).toBe("Monte Alegre");
  });

  it("falls back to municipality", () => {
    expect(pickCityName({ municipality: "Ribeirão Preto" })).toBe("Ribeirão Preto");
  });

  it("falls back to county as last resort", () => {
    expect(pickCityName({ county: "Orange County" })).toBe("Orange County");
  });

  it("returns null when no location name is available", () => {
    expect(pickCityName({ state: "SP", country: "Brazil" })).toBeNull();
  });

  it("returns null for null input", () => {
    expect(pickCityName(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(pickCityName(undefined)).toBeNull();
  });

  it("prioritizes city over town and village", () => {
    expect(pickCityName({ city: "SP", town: "Campinas", village: "Vila" })).toBe("SP");
  });
});

describe("buildLocationPayload", () => {
  it("builds a complete payload with city, state and country", () => {
    const data = {
      display_name: "Full display name",
      address: {
        city: "São Paulo",
        state: "São Paulo",
        country: "Brazil",
      },
    };
    const result = buildLocationPayload(data, -23.55, -46.63);

    expect(result.cityName).toBe("São Paulo");
    expect(result.state).toBe("São Paulo");
    expect(result.country).toBe("Brazil");
    expect(result.locationLabel).toBe("São Paulo, São Paulo, Brazil");
  });

  it("uses display_name when no structured address parts match", () => {
    const data = {
      display_name: "Middle of the Ocean",
      address: {},
    };
    const result = buildLocationPayload(data, 0, 0);

    expect(result.cityName).toBeNull();
    expect(result.locationLabel).toBe("Middle of the Ocean");
  });

  it("returns coordinate-based label when data is null", () => {
    const result = buildLocationPayload(null, -15.78, -47.93);

    expect(result.cityName).toBeNull();
    expect(result.state).toBeNull();
    expect(result.country).toBeNull();
    expect(result.locationLabel).toBe("Lat -15.78, Lng -47.93");
  });

  it("builds label with only country when city and state are missing", () => {
    const data = {
      address: { country: "Antarctica" },
    };
    const result = buildLocationPayload(data, -90, 0);

    expect(result.locationLabel).toBe("Antarctica");
  });

  it("builds label with village and country", () => {
    const data = {
      address: {
        village: "Small Village",
        country: "France",
      },
    };
    const result = buildLocationPayload(data, 48.85, 2.35);

    expect(result.cityName).toBe("Small Village");
    expect(result.locationLabel).toBe("Small Village, France");
  });
});
