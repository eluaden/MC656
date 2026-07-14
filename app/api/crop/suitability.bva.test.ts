// Testes por Análise de Valor Limite (A5) da função suitability.
// Ela tem quatro limiares (absMin, optMin, optMax, absMax), então testamos cada
// um no ponto exato e logo antes/depois. Faixa usada: 10, 20, 30, 40.

import { suitability, type EcocropRange } from "./crop-utils";

describe("suitability - Análise de Valor Limite", () => {
  const range: EcocropRange = { absMin: 10, optMin: 20, optMax: 30, absMax: 40 };

  it("limiar absMin: 0 no ponto e abaixo, sobe logo acima", () => {
    expect(suitability(9.99, range)).toBe(0);
    expect(suitability(10, range)).toBe(0);
    expect(suitability(10.01, range)).toBeCloseTo(0.001, 5);
  });

  it("limiar optMin: quase 1 logo abaixo, exatamente 1 no ponto", () => {
    expect(suitability(19.99, range)).toBeCloseTo(0.999, 5);
    expect(suitability(20, range)).toBe(1);
    expect(suitability(20.01, range)).toBe(1);
  });

  it("limiar optMax: 1 no ponto, começa a cair logo acima", () => {
    expect(suitability(29.99, range)).toBe(1);
    expect(suitability(30, range)).toBe(1);
    expect(suitability(30.01, range)).toBeCloseTo(0.999, 5);
  });

  it("limiar absMax: quase 0 logo abaixo, 0 no ponto e acima", () => {
    expect(suitability(39.99, range)).toBeCloseTo(0.001, 5);
    expect(suitability(40, range)).toBe(0);
    expect(suitability(40.01, range)).toBe(0);
  });

  it("valor desconhecido (null) é ignorado", () => {
    expect(suitability(null, range)).toBeNull();
  });
});
