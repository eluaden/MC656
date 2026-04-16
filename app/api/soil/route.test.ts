import { getLayerMean, hasUsefulSoilData, buildSoilSummary } from "./soil-utils";

const makeSoilData = (layers: Record<string, number | null>) => ({
  properties: {
    layers: Object.entries(layers).map(([name, mean]) => ({
      name,
      depths: [{ label: "0-5cm", values: { mean } }],
    })),
  },
});

describe("getLayerMean", () => {
  it("extracts the mean value for a given layer", () => {
    const data = makeSoilData({ clay: 350, sand: 500 });
    expect(getLayerMean(data, "clay")).toBe(350);
    expect(getLayerMean(data, "sand")).toBe(500);
  });

  it("returns null for a missing layer", () => {
    const data = makeSoilData({ clay: 350 });
    expect(getLayerMean(data, "silt")).toBeNull();
  });

  it("returns null for empty data", () => {
    expect(getLayerMean({}, "clay")).toBeNull();
  });

  it("returns null when mean is null", () => {
    const data = makeSoilData({ clay: null });
    expect(getLayerMean(data, "clay")).toBeNull();
  });
});

describe("hasUsefulSoilData", () => {
  it("returns true when at least one property has data", () => {
    const data = makeSoilData({ clay: 350 });
    expect(hasUsefulSoilData(data)).toBe(true);
  });

  it("returns false when all values are null", () => {
    const data = makeSoilData({ clay: null, sand: null, silt: null, phh2o: null, soc: null });
    expect(hasUsefulSoilData(data)).toBe(false);
  });

  it("returns false for empty data", () => {
    expect(hasUsefulSoilData({})).toBe(false);
  });
});

describe("buildSoilSummary", () => {
  it("builds a summary with all soil properties", () => {
    const data = makeSoilData({ clay: 350, sand: 500, silt: 150, phh2o: 65, soc: 12 });
    const result = buildSoilSummary(data);

    expect(result.clay).toBe(350);
    expect(result.sand).toBe(500);
    expect(result.silt).toBe(150);
    expect(result.ph).toBe(65);
    expect(result.organicCarbon).toBe(12);
    expect(result.soilSummary).toContain("pH aproximado: 6.5");
    expect(result.soilSummary).toContain("Argila: 35%");
    expect(result.soilSummary).toContain("Areia: 50%");
    expect(result.soilSummary).toContain("Silte: 15%");
    expect(result.soilSummary).toContain("Carbono orgânico: 1.2 g/kg");
  });

  it("builds a partial summary when some properties are missing", () => {
    const data = makeSoilData({ clay: 200, phh2o: 55 });
    const result = buildSoilSummary(data);

    expect(result.soilSummary).toContain("Argila: 20%");
    expect(result.soilSummary).toContain("pH aproximado: 5.5");
    expect(result.soilSummary).not.toContain("Areia");
  });

  it("returns fallback message when no data is available", () => {
    const result = buildSoilSummary({});
    expect(result.soilSummary).toBe("Sem dados de solo nesse ponto exato.");
  });

  it("uses pipe separator between properties", () => {
    const data = makeSoilData({ clay: 300, sand: 400 });
    const result = buildSoilSummary(data);
    expect(result.soilSummary).toContain(" | ");
  });
});
