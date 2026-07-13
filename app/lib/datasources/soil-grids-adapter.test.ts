import { SoilGridsAdapter } from "./soil-grids-adapter";

const makeSoilData = (layers: Record<string, number | null>) => ({
  properties: {
    layers: Object.entries(layers).map(([name, mean]) => ({
      name,
      depths: [{ label: "0-5cm", values: { mean } }],
    })),
  },
});

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("SoilGridsAdapter", () => {
  it("adapts a SoilGrids response into the internal soil data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => makeSoilData({ clay: 350, sand: 500, silt: 150, phh2o: 65, soc: 12 }),
    });

    const adapter = new SoilGridsAdapter();
    const result = await adapter.fetch({ lat: -23, lng: -46 });

    expect(result.source).toBe("SoilGrids");
    expect(result.hasData).toBe(true);
    expect(result.clay).toBe(350);
    expect(result.soilSummary).toContain("Argila: 35%");
  });
});
