"use client";

import { useCallback, useEffect, useState } from "react";
import { CellState, GridState } from "../types";

const STORAGE_KEY = "cropGridState";

export const MIN_SIZE = 2;
export const MAX_SIZE = 40;

const DEFAULT_STATE: GridState = {
  rows: 12,
  cols: 20,
  cells: Array(12 * 20).fill(null),
  day: 0,
};

function clampSize(value: number): number {
  if (Number.isNaN(value)) return MIN_SIZE;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(value)));
}

/**
 * Normaliza uma célula persistida. Aceita o formato antigo (string com o id
 * da cultura) e o atual ({cropId, plantedDay}).
 */
function parseCell(raw: unknown): CellState | null {
  if (typeof raw === "string") {
    return { cropId: raw, plantedDay: 0 };
  }
  if (raw && typeof raw === "object" && "cropId" in raw) {
    const cell = raw as { cropId: unknown; plantedDay?: unknown };
    if (typeof cell.cropId !== "string") return null;
    const plantedDay = Number(cell.plantedDay);
    return {
      cropId: cell.cropId,
      plantedDay: Number.isFinite(plantedDay) && plantedDay > 0 ? plantedDay : 0,
    };
  }
  return null;
}

function loadSavedState(): GridState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(saved) as Partial<GridState>;
    const rows = clampSize(Number(parsed.rows));
    const cols = clampSize(Number(parsed.cols));
    const cells = Array.isArray(parsed.cells) ? parsed.cells : [];
    const normalized = Array(rows * cols)
      .fill(null)
      .map((_, i) => parseCell(cells[i]));
    const day = Number(parsed.day);
    return {
      rows,
      cols,
      cells: normalized,
      day: Number.isFinite(day) && day > 0 ? day : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** Copies the planted cells into a grid of a new size, preserving overlap. */
function resizeCells(
  prev: GridState,
  rows: number,
  cols: number,
): (CellState | null)[] {
  const next = Array<CellState | null>(rows * cols).fill(null);
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
  // Começa sempre com o estado padrão e só aplica o que está salvo após a
  // montagem: ler o localStorage durante a primeira renderização divergiria
  // do HTML gerado no servidor (hydration mismatch).
  const [state, setState] = useState<GridState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadSavedState());
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
      if (prev.cells[index]?.cropId === cropId) return prev;
      const cells = [...prev.cells];
      cells[index] = { cropId, plantedDay: prev.day };
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
        ...prev,
        rows: nextRows,
        cols: nextCols,
        cells: resizeCells(prev, nextRows, nextCols),
      };
    });
  }, []);

  /** Avança o relógio da simulação em `delta` dias (pode ser fracionário). */
  const advanceDays = useCallback((delta: number) => {
    if (!Number.isFinite(delta) || delta <= 0) return;
    setState((prev) => ({ ...prev, day: prev.day + delta }));
  }, []);

  /** Volta a simulação ao dia zero, com todas as plantas no estágio inicial. */
  const resetSimulation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      day: 0,
      cells: prev.cells.map((cell) =>
        cell ? { ...cell, plantedDay: 0 } : null,
      ),
    }));
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
    advanceDays,
    resetSimulation,
  };
}
