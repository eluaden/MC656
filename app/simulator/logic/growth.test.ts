import {
  cropSuitability,
  growthProgress,
  growthStage,
  WITHERED_MAX_PROGRESS,
  WITHER_THRESHOLD,
} from "./growth";
import { FieldConditions } from "../types";

const OPTIMAL_SOY: FieldConditions = {
  temperature: 25,
  ph: 6,
  source: "manual",
};

describe("cropSuitability", () => {
  it("retorna 1 dentro da faixa ótima da cultura", () => {
    // Soja: ótimo 20–33 °C e pH 5,5–6,5 (FAO Ecocrop).
    expect(cropSuitability("soja", OPTIMAL_SOY)).toBe(1);
  });

  it("retorna 0 fora da faixa absoluta", () => {
    expect(
      cropSuitability("soja", { temperature: 45, ph: 6, source: "manual" }),
    ).toBe(0);
  });

  it("combina temperatura e pH por multiplicação", () => {
    // Temperatura ótima, pH a meio caminho entre absMin (4,5) e optMin (5,5).
    const suit = cropSuitability("soja", {
      temperature: 25,
      ph: 5,
      source: "manual",
    });
    expect(suit).toBeCloseTo(0.5);
  });

  it("cultura desconhecida recebe adequação neutra (1)", () => {
    expect(cropSuitability("inexistente", OPTIMAL_SOY)).toBe(1);
  });
});

describe("growthProgress", () => {
  it("é 0 no dia do plantio", () => {
    expect(growthProgress(0, 120, 1)).toBe(0);
  });

  it("atinge 1 ao fim do ciclo em condições ótimas", () => {
    expect(growthProgress(120, 120, 1)).toBe(1);
  });

  it("nunca passa de 1", () => {
    expect(growthProgress(500, 120, 1)).toBe(1);
  });

  it("cresce mais devagar com adequação menor", () => {
    const optimal = growthProgress(60, 120, 1);
    const poor = growthProgress(60, 120, 0.3);
    expect(poor).toBeLessThan(optimal);
    expect(poor).toBeGreaterThan(0);
  });

  it("estaciona no teto de murcha quando a adequação é insuficiente", () => {
    const progress = growthProgress(1000, 120, WITHER_THRESHOLD / 2);
    expect(progress).toBe(WITHERED_MAX_PROGRESS);
  });
});

describe("growthStage", () => {
  it("percorre semente → broto → crescimento → colheita", () => {
    expect(growthStage(0, 1)).toBe("semente");
    expect(growthStage(0.2, 1)).toBe("broto");
    expect(growthStage(0.7, 1)).toBe("crescimento");
    expect(growthStage(1, 1)).toBe("colheita");
  });

  it("marca murcha quando a planta estagna por condições ruins", () => {
    expect(growthStage(WITHERED_MAX_PROGRESS, WITHER_THRESHOLD / 2)).toBe(
      "murcha",
    );
  });

  it("antes de estagnar, a planta em condições ruins ainda mostra estágios iniciais", () => {
    expect(growthStage(0.05, WITHER_THRESHOLD / 2)).toBe("semente");
  });
});
