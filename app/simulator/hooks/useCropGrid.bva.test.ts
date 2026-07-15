// Testes por Análise de Valor Limite (A5) do useCropGrid, em duas frentes:
// - tamanho do grid: o valor é limitado entre MIN_SIZE (2) e MAX_SIZE (40), então
//   testamos abaixo, no mínimo, no máximo, acima e um valor inválido (NaN).
// - índice da célula: só vale de 0 até length-1, então testamos as bordas -1, 0,
//   último válido e o primeiro inválido.

import { renderHook, act } from "@testing-library/react";
import { useCropGrid, MIN_SIZE, MAX_SIZE } from "./useCropGrid";
import { CROPS } from "../data/crops";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const CROP = CROPS[0].id;

beforeEach(() => {
  localStorageMock.clear();
});

describe("useCropGrid - Análise de Valor Limite no tamanho do grid", () => {
  it("abaixo do mínimo é elevado a MIN_SIZE", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(1, 1));
    expect(result.current.state.rows).toBe(MIN_SIZE);
    expect(result.current.state.cols).toBe(MIN_SIZE);
    expect(result.current.state.cells).toHaveLength(MIN_SIZE * MIN_SIZE);
  });

  it("aceita o mínimo exato (2)", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(2, 2));
    expect(result.current.state.rows).toBe(2);
    expect(result.current.state.cols).toBe(2);
  });

  it("aceita o máximo exato (40)", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(MAX_SIZE, MAX_SIZE));
    expect(result.current.state.rows).toBe(MAX_SIZE);
    expect(result.current.state.cols).toBe(MAX_SIZE);
  });

  it("acima do máximo é limitado a MAX_SIZE", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(41, 50));
    expect(result.current.state.rows).toBe(MAX_SIZE);
    expect(result.current.state.cols).toBe(MAX_SIZE);
  });

  it("valor inválido (NaN) cai para MIN_SIZE", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(Number.NaN, 5));
    expect(result.current.state.rows).toBe(MIN_SIZE);
    expect(result.current.state.cols).toBe(5);
  });
});

describe("useCropGrid - Análise de Valor Limite nos índices de célula", () => {
  it("ignora índice abaixo do início (-1)", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(2, 2));
    act(() => result.current.plantCell(-1, CROP));
    expect(result.current.plantedCount).toBe(0);
  });

  it("planta no primeiro índice válido (0) e no último (length-1)", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(2, 2)); // length = 4
    act(() => {
      result.current.plantCell(0, CROP);
      result.current.plantCell(3, CROP);
    });
    expect(result.current.state.cells[0]?.cropId).toBe(CROP);
    expect(result.current.state.cells[3]?.cropId).toBe(CROP);
    expect(result.current.plantedCount).toBe(2);
  });

  it("ignora índice igual ao tamanho (length)", () => {
    const { result } = renderHook(() => useCropGrid());
    act(() => result.current.setSize(2, 2)); // length = 4
    act(() => result.current.plantCell(4, CROP));
    expect(result.current.plantedCount).toBe(0);
  });
});
