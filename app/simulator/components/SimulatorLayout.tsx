"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CROPS, getCrop } from "../data/crops";
import { ERASER_TOOL, Tool } from "../types";
import { MAX_SIZE, MIN_SIZE, useCropGrid } from "../hooks/useCropGrid";
import { useFieldConditions } from "../hooks/useFieldConditions";
import {
  cropSuitability,
  growthProgress,
  growthStage,
  STAGE_LABELS,
} from "../logic/growth";
import { CropPalette } from "./CropPalette";
import { ConditionsPanel } from "./ConditionsPanel";
import { FieldCanvas } from "./FieldCanvas";
import { Speed, TimeControls } from "./TimeControls";

/** Dias simulados por segundo real na velocidade 1x. */
const BASE_DAYS_PER_SECOND = 4;
const CLOCK_TICK_MS = 100;

export function SimulatorLayout() {
  const {
    state,
    isLoaded,
    plantedCount,
    plantCell,
    clearCell,
    clearAll,
    setSize,
    advanceDays,
    resetSimulation,
  } = useCropGrid();
  const { conditions, adjust, isFetchingMap } = useFieldConditions();

  const [activeTool, setActiveTool] = useState<Tool>(CROPS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePaintCell = useCallback(
    (index: number) => {
      if (activeTool === ERASER_TOOL) {
        clearCell(index);
      } else {
        plantCell(index, activeTool);
      }
    },
    [activeTool, clearCell, plantCell],
  );

  // Relógio da simulação: avança o dia enquanto estiver em reprodução.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      advanceDays((speed * BASE_DAYS_PER_SECOND * CLOCK_TICK_MS) / 1000);
    }, CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, speed, advanceDays]);

  const handleReset = () => {
    setIsPlaying(false);
    resetSimulation();
  };

  const hoveredCell =
    hoveredIndex !== null ? (state.cells[hoveredIndex] ?? null) : null;
  const hoveredCrop = getCrop(hoveredCell?.cropId ?? null);

  return (
    <div className="starry-bg relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 z-[1]">
        {isLoaded ? (
          <FieldCanvas
            rows={state.rows}
            cols={state.cols}
            cells={state.cells}
            day={state.day}
            conditions={conditions}
            onPaintCell={handlePaintCell}
            onHoverCell={setHoveredIndex}
          />
        ) : (
          <p className="flex h-full items-center justify-center text-gray-500">
            Carregando terreno...
          </p>
        )}
      </div>

      {/* Barra superior: título/voltar à esquerda, tamanho e limpeza à direita. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-5">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 text-sm font-medium text-gray-300 shadow-2xl shadow-black/40 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <div className="rounded-xl border border-white/[0.08] bg-black/60 px-4 py-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <h1 className="text-base font-bold text-white">
              Simulador de Plantio
            </h1>
            <p className="text-[11px] text-gray-400">
              Clique ou arraste no terreno para plantar · arraste fora dele para
              girar a câmera
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-3 rounded-xl border border-white/[0.08] bg-black/60 px-4 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
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
          <span className="text-xs text-gray-400">
            {plantedCount}/{state.rows * state.cols} plantadas
          </span>
          <button
            type="button"
            onClick={clearAll}
            disabled={plantedCount === 0}
            className="rounded-lg border border-white/[0.06] px-2.5 py-1 text-xs text-gray-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar tudo
          </button>
        </div>
      </div>

      {/* Coluna esquerda: paleta de culturas e condições do terreno. */}
      <aside className="absolute bottom-28 left-5 top-24 z-10 flex w-64 flex-col gap-3 overflow-y-auto">
        <CropPalette
          activeTool={activeTool}
          conditions={conditions}
          onSelect={setActiveTool}
        />
        <ConditionsPanel
          conditions={conditions}
          isFetchingMap={isFetchingMap}
          onAdjust={adjust}
        />
      </aside>

      {/* Controle do tempo, centralizado na base. */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <TimeControls
          day={state.day}
          isPlaying={isPlaying}
          speed={speed}
          onTogglePlay={() => setIsPlaying((v) => !v)}
          onSpeedChange={setSpeed}
          onStepDays={advanceDays}
          onReset={handleReset}
        />
      </div>

      {/* Detalhes da célula sob o cursor. */}
      {hoveredCell && hoveredCrop && (
        <HoveredCellCard
          cropName={hoveredCrop.name}
          emoji={hoveredCrop.emoji}
          plantedDay={hoveredCell.plantedDay}
          day={state.day}
          cycleDays={hoveredCrop.cycleDays}
          suit={cropSuitability(hoveredCrop.id, conditions)}
        />
      )}
    </div>
  );
}

type HoveredCellCardProps = {
  cropName: string;
  emoji: string;
  plantedDay: number;
  day: number;
  cycleDays: number;
  suit: number;
};

function HoveredCellCard({
  cropName,
  emoji,
  plantedDay,
  day,
  cycleDays,
  suit,
}: HoveredCellCardProps) {
  const progress = growthProgress(day - plantedDay, cycleDays, suit);
  const stage = growthStage(progress, suit);

  return (
    <div className="absolute bottom-6 right-6 z-10 w-56 rounded-2xl border border-white/[0.08] bg-black/70 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-base leading-none">{emoji}</span>
        {cropName}
      </p>
      <dl className="mt-2 space-y-1 text-xs text-gray-400">
        <div className="flex justify-between">
          <dt>Estágio</dt>
          <dd className="font-medium text-gray-200">{STAGE_LABELS[stage]}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Plantada no dia</dt>
          <dd className="font-medium text-gray-200">{Math.floor(plantedDay)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Adequação</dt>
          <dd className="font-medium text-gray-200">{Math.round(suit * 100)}%</dd>
        </div>
      </dl>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] ${
            stage === "murcha" ? "bg-amber-700" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
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
    <label className="flex items-center gap-1.5 text-xs text-gray-300">
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
        className="w-12 rounded-lg border border-white/[0.08] bg-white/[0.02] px-1.5 py-1 text-center text-white focus:border-emerald-400/50 focus:outline-none"
      />
    </label>
  );
}
