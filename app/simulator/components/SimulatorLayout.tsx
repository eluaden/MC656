"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CROPS } from "../data/crops";
import { ERASER_TOOL, Tool } from "../types";
import { MAX_SIZE, MIN_SIZE, useCropGrid } from "../hooks/useCropGrid";
import { CropPalette } from "./CropPalette";
import { CropGrid } from "./CropGrid";

export function SimulatorLayout() {
  const { state, isLoaded, plantedCount, plantCell, clearCell, clearAll, setSize } =
    useCropGrid();
  const [activeTool, setActiveTool] = useState<Tool>(CROPS[0].id);
  const [isPainting, setIsPainting] = useState(false);

  const applyTool = useCallback(
    (index: number) => {
      if (activeTool === ERASER_TOOL) {
        clearCell(index);
      } else {
        plantCell(index, activeTool);
      }
    },
    [activeTool, clearCell, plantCell],
  );

  const handleCellPointerDown = (index: number) => {
    setIsPainting(true);
    applyTool(index);
  };

  const handleCellPointerEnter = (index: number) => {
    if (isPainting) applyTool(index);
  };

  // Stop painting when the pointer is released anywhere (even outside the grid).
  useEffect(() => {
    const stop = () => setIsPainting(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  return (
    <div className="starry-bg min-h-screen w-full">
      <div className="relative z-[1] mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mapa de Plantio</h1>
            <p className="text-gray-400">
              Selecione uma cultura e clique (ou clique e arraste) nas células
              para plantar.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            Voltar
          </Link>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-64 lg:shrink-0">
            <CropPalette activeTool={activeTool} onSelect={setActiveTool} />
          </aside>

          <section className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-xl">
              <SizeControl
                label="Linhas"
                value={state.rows}
                onChange={(rows) => setSize(rows, state.cols)}
              />
              <SizeControl
                label="Colunas"
                value={state.cols}
                onChange={(cols) => setSize(state.rows, cols)}
              />
              <div className="ml-auto flex items-center gap-3 text-sm text-gray-400">
                <span>
                  {plantedCount} de {state.rows * state.cols} células plantadas
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={plantedCount === 0}
                  className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-gray-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Limpar tudo
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-xl">
              {isLoaded ? (
                <CropGrid
                  state={state}
                  onCellPointerDown={handleCellPointerDown}
                  onCellPointerEnter={handleCellPointerEnter}
                />
              ) : (
                <p className="py-12 text-center text-gray-500">Carregando terreno...</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

type SizeControlProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function SizeControl({ label, value, onChange }: SizeControlProps) {
  // Keep a free-text draft so the user can type any number; only clamp/apply
  // on blur or Enter (applying on every keystroke would fight the typing).
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (draft.trim() === "" || Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    onChange(parsed);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <input
        type="number"
        min={MIN_SIZE}
        max={MAX_SIZE}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-16 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5 text-center text-white focus:border-emerald-400/50 focus:outline-none"
      />
    </label>
  );
}
