import {
  classifyTexture,
  textureLabel,
  suitability,
  scoreCrop,
  recommendCrops,
  CROP_TABLE,
  type Crop,
  type CropConditions,
  type EcocropRange,
} from "./crop-utils";

describe("classifyTexture", () => {
  it("returns 'desconhecido' when both fractions are null", () => {
    expect(classifyTexture(null, null)).toBe("desconhecido");
  });

  it("returns 'arenoso' for high sand content", () => {
    expect(classifyTexture(10, 75)).toBe("arenoso");
  });

  it("returns 'argiloso' for high clay content", () => {
    expect(classifyTexture(45, 20)).toBe("argiloso");
  });

  it("returns 'franco' for balanced soil", () => {
    expect(classifyTexture(25, 40)).toBe("franco");
  });

  it("prioritizes high sand over clay", () => {
    expect(classifyTexture(40, 72)).toBe("arenoso");
  });
});

describe("textureLabel", () => {
  it("returns a readable label for each texture", () => {
    expect(textureLabel("arenoso")).toBe("Solo arenoso");
    expect(textureLabel("franco")).toBe("Solo franco (equilibrado)");
    expect(textureLabel("argiloso")).toBe("Solo argiloso");
    expect(textureLabel("desconhecido")).toBe("Textura do solo desconhecida");
  });
});

describe("suitability (ECOCROP trapezoidal model)", () => {
  const range: EcocropRange = { absMin: 10, optMin: 20, optMax: 30, absMax: 40 };

  it("returns 1 inside the optimal range", () => {
    expect(suitability(20, range)).toBe(1);
    expect(suitability(25, range)).toBe(1);
    expect(suitability(30, range)).toBe(1);
  });

  it("returns null when the value is unknown", () => {
    expect(suitability(null, range)).toBeNull();
  });

  it("returns 0 outside the absolute range", () => {
    expect(suitability(10, range)).toBe(0);
    expect(suitability(40, range)).toBe(0);
    expect(suitability(5, range)).toBe(0);
    expect(suitability(50, range)).toBe(0);
  });

  it("ramps up linearly between absMin and optMin", () => {
    // halfway from 10 -> 20 should be 0.5
    expect(suitability(15, range)).toBeCloseTo(0.5);
  });

  it("ramps down linearly between optMax and absMax", () => {
    // halfway from 30 -> 40 should be 0.5
    expect(suitability(35, range)).toBeCloseTo(0.5);
  });
});

describe("scoreCrop", () => {
  const crop: Crop = {
    id: "test",
    name: "Test",
    emoji: "🧪",
    temp: { absMin: 10, optMin: 20, optMax: 30, absMax: 40 },
    ph: { absMin: 4.5, optMin: 5.5, optMax: 6.5, absMax: 8 },
    rainfall: { absMin: 400, optMin: 600, optMax: 1200, absMax: 1800 },
    description: "",
    tips: "",
  };

  it("returns 100 when both factors are optimal", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: 25,
      sandPct: 40,
      siltPct: 35,
      temperature: 25,
    };
    expect(scoreCrop(crop, conditions)).toBe(100);
  });

  it("returns 0 when a factor is outside the absolute range", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: null,
      sandPct: null,
      siltPct: null,
      temperature: 45, // acima do absMax
    };
    expect(scoreCrop(crop, conditions)).toBe(0);
  });

  it("returns 0 without soil data (pH) even if temperature is optimal", () => {
    const conditions: CropConditions = {
      ph: null,
      clayPct: null,
      sandPct: null,
      siltPct: null,
      temperature: 25,
    };
    expect(scoreCrop(crop, conditions)).toBe(0);
  });

  it("scores on pH alone when temperature is unknown", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: null,
      sandPct: null,
      siltPct: null,
      temperature: null,
    };
    expect(scoreCrop(crop, conditions)).toBe(100);
  });

  it("returns 0 when no factor is known", () => {
    const conditions: CropConditions = {
      ph: null,
      clayPct: null,
      sandPct: null,
      siltPct: null,
      temperature: null,
    };
    expect(scoreCrop(crop, conditions)).toBe(0);
  });

  it("stays within 0..100", () => {
    const conditions: CropConditions = {
      ph: 7,
      clayPct: null,
      sandPct: null,
      siltPct: null,
      temperature: 18,
    };
    const score = scoreCrop(crop, conditions);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("recommendCrops", () => {
  it("returns at most the requested number of crops", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: 20,
      sandPct: 40,
      siltPct: 40,
      temperature: 25,
    };
    expect(recommendCrops(conditions, 3)).toHaveLength(3);
    expect(recommendCrops(conditions)).toHaveLength(4);
  });

  it("sorts recommendations by score descending", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: 20,
      sandPct: 40,
      siltPct: 40,
      temperature: 25,
    };
    const result = recommendCrops(conditions);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });

  it("recommends warm-climate crops for hot regions", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: 45,
      sandPct: 15,
      siltPct: 40,
      temperature: 38,
    };
    const ids = recommendCrops(conditions).map((c) => c.id);
    // a 38 °C, cana/algodão (alta exigência térmica) devem aparecer;
    // trigo/batata (clima ameno) já estão fora da faixa absoluta.
    expect(ids).toContain("cana");
    expect(ids).not.toContain("trigo");
  });

  it("recommends cool-climate crops for cold regions", () => {
    const conditions: CropConditions = {
      ph: 6.5,
      clayPct: 25,
      sandPct: 35,
      siltPct: 40,
      temperature: 14,
    };
    const ids = recommendCrops(conditions).map((c) => c.id);
    expect(ids.some((id) => id === "trigo" || id === "batata")).toBe(true);
  });

  it("assigns a matchLabel consistent with the score", () => {
    const conditions: CropConditions = {
      ph: 6,
      clayPct: 20,
      sandPct: 40,
      siltPct: 40,
      temperature: 25,
    };
    for (const rec of recommendCrops(conditions)) {
      if (rec.score >= 70) expect(rec.matchLabel).toBe("Alta");
      else if (rec.score >= 40) expect(rec.matchLabel).toBe("Média");
      else expect(rec.matchLabel).toBe("Baixa");
    }
  });

  it("returns every crop at 0% when there is no soil data", () => {
    const conditions: CropConditions = {
      ph: null,
      clayPct: null,
      sandPct: null,
      siltPct: null,
      temperature: 25,
    };
    const result = recommendCrops(conditions);
    expect(result).toHaveLength(4);
    for (const rec of result) {
      expect(rec.score).toBe(0);
      expect(rec.matchLabel).toBe("Baixa");
    }
  });

  it("covers the expected crops from the FAO Ecocrop table", () => {
    expect(CROP_TABLE.length).toBe(10);
    expect(CROP_TABLE.map((c) => c.id)).toContain("soja");
  });
});
