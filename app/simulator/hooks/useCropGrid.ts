"use client";

import { useCallback, useEffect, useState } from "react";
import { GridState } from "../types";

const STORAGE_KEY = "cropGridState";

export const MIN_SIZE = 2;
export const MAX_SIZE = 40;

const DEFAULT_STATE: GridState = {
  rows: 12,
  cols: 20,
  cells: Array(12 * 20).fill(null),
};

function clampSize(value: number): number {
  if (Number.isNaN(value)) return MIN_SIZE;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(value)));
}

function getInitialState(): GridState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(saved) as Partial<GridState>;
    const rows = clampSize(Number(parsed.rows));
    const cols = clampSize(Number(parsed.cols));
    const cells = Array.isArray(parsed.cells) ? parsed.cells : [];
    const normalized = Array(rows * cols)
      .fill(null)
      .map((_, i) => (typeof cells[i] === "string" ? cells[i] : null));
    return { rows, cols, cells: normalized };
  } catch {
    return DEFAULT_STATE;
  }
}

/** Copies the planted cells into a grid of a new size, preserving overlap. */
function resizeCells(
  prev: GridState,
  rows: number,
  cols: number,
): (string | null)[] {
  const next = Array<string | null>(rows * cols).fill(null);
  const sharedRows = Math.min(prev.rows, rows);
  const sharedCols = Math.min(prev.cols, cols);
  for (let r = 0; r < sharedRows; r++) {
    for (let c = 0; c < sharedCols; c++) {
      next[r * cols + c] = prev.cells[r * prev.cols + c] ?? null;
    }
  }
  return next;
}

export function useCropGrid() {
  const [state, setState] = useState<GridState>(getInitialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const plantCell = useCallback((index: number, cropId: string) => {
    setState((prev) => {
      if (index < 0 || index >= prev.cells.length) return prev;
      if (prev.cells[index] === cropId) return prev;
      const cells = [...prev.cells];
      cells[index] = cropId;
      return { ...prev, cells };
    });
  }, []);

  const clearCell = useCallback((index: number) => {
    setState((prev) => {
      if (index < 0 || index >= prev.cells.length) return prev;
      if (prev.cells[index] === null) return prev;
      const cells = [...prev.cells];
      cells[index] = null;
      return { ...prev, cells };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cells: Array(prev.rows * prev.cols).fill(null),
    }));
  }, []);

  const setSize = useCallback((rows: number, cols: number) => {
    setState((prev) => {
      const nextRows = clampSize(rows);
      const nextCols = clampSize(cols);
      if (nextRows === prev.rows && nextCols === prev.cols) return prev;
      return {
        rows: nextRows,
        cols: nextCols,
        cells: resizeCells(prev, nextRows, nextCols),
      };
    });
  }, []);

  const plantedCount = state.cells.filter((cell) => cell !== null).length;

  return {
    state,
    isLoaded,
    plantedCount,
    plantCell,
    clearCell,
    clearAll,
    setSize,
  };
}
