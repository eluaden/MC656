import { NominatimAdapter } from "./nominatim-adapter";

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("NominatimAdapter", () => {
  it("adapts a Nominatim response into the internal location data", async () => {
    const data = {
      display_name: "São Paulo, Brazil",
      address: { city: "São Paulo", state: "São Paulo", country: "Brazil" },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => data,
    });

    const adapter = new NominatimAdapter();
    const result = await adapter.fetch({ lat: -23.55, lng: -46.63 });

    expect(result.source).toBe("Nominatim");
    expect(result.cityName).toBe("São Paulo");
    expect(result.locationLabel).toBe("São Paulo, São Paulo, Brazil");
  });
});
