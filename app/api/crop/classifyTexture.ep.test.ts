// Testes por Particionamento em Classes de Equivalência (A5) da classifyTexture.
// A função separa o solo em quatro saídas conforme os teores de argila e areia,
// então dividimos as entradas em classes e testamos um representante de cada:
// - sem dados (argila e areia null) -> desconhecido
// - muita areia -> arenoso
// - pouca areia e muita argila -> argiloso
// - pouca areia e pouca argila -> franco

import { classifyTexture } from "./crop-utils";

describe("classifyTexture - Particionamento em Classes de Equivalência", () => {
  it("sem dados de argila e areia -> desconhecido", () => {
    expect(classifyTexture(null, null)).toBe("desconhecido");
  });

  it("alto teor de areia -> arenoso", () => {
    expect(classifyTexture(20, 80)).toBe("arenoso");
    expect(classifyTexture(null, 90)).toBe("arenoso");
  });

  it("pouca areia e muita argila -> argiloso", () => {
    expect(classifyTexture(55, 30)).toBe("argiloso");
    expect(classifyTexture(45, null)).toBe("argiloso");
  });

  it("pouca areia e pouca argila -> franco", () => {
    expect(classifyTexture(20, 40)).toBe("franco");
    expect(classifyTexture(10, null)).toBe("franco");
    expect(classifyTexture(null, 50)).toBe("franco");
  });
});
