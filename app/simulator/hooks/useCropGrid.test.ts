import { renderHook, act } from "@testing-library/react";
import { useCropGrid } from "./useCropGrid";
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

describe("useCropGrid", () => {
  it("initializes with the default grid and all cells empty", () => {
    const { result } = renderHook(() => useCropGrid());

    expect(result.current.state.rows).toBe(12);
    expect(result.current.state.cols).toBe(20);
    expect(result.current.state.cells).toHaveLength(12 * 20);
    expect(result.current.state.cells.every((cell) => cell === null)).toBe(true);
    expect(result.current.plantedCount).toBe(0);
  });

  it("plants a crop in the chosen cell", () => {
    const { result } = renderHook(() => useCropGrid());

    act(() => result.current.plantCell(5, CROP));

    expect(result.current.state.cells[5]).toBe(CROP);
  });

  it("clears a planted cell", () => {
    const { result } = renderHook(() => useCropGrid());

    act(() => result.current.plantCell(5, CROP));
    act(() => result.current.clearCell(5));

    expect(result.current.state.cells[5]).toBeNull();
  });

  it("clears all cells", () => {
    const { result } = renderHook(() => useCropGrid());

    act(() => {
      result.current.plantCell(0, CROP);
      result.current.plantCell(7, CROP);
    });
    act(() => result.current.clearAll());

    expect(result.current.state.cells.every((cell) => cell === null)).toBe(true);
  });

  it("keeps existing plantings when the grid is resized larger", () => {
    const { result } = renderHook(() => useCropGrid());

    act(() => result.current.setSize(3, 3));
    // row 1, col 1 -> index 1 * 3 + 1 = 4 in a 3-column grid
    act(() => result.current.plantCell(4, CROP));
    act(() => result.current.setSize(5, 5));

    // same row 1, col 1 -> index 1 * 5 + 1 = 6 in a 5-column grid
    expect(result.current.state.cells[6]).toBe(CROP);
  });

  it("counts the planted cells", () => {
    const { result } = renderHook(() => useCropGrid());

    act(() => {
      result.current.plantCell(0, CROP);
      result.current.plantCell(1, CROP);
      result.current.plantCell(2, CROP);
    });

    expect(result.current.plantedCount).toBe(3);
  });
});
