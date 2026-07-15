"use client";

import { CROPS } from "../data/crops";
import { cropSuitability } from "../logic/growth";
import { ERASER_TOOL, FieldConditions, Tool } from "../types";

type CropPaletteProps = {
  activeTool: Tool;
  conditions: FieldConditions;
  onSelect: (tool: Tool) => void;
};

function badgeClass(score: number): string {
  if (score >= 70) return "bg-emerald-500/15 text-emerald-400";
  if (score >= 40) return "bg-amber-500/15 text-amber-400";
  return "bg-red-500/15 text-red-400";
}

export function CropPalette({
  activeTool,
  conditions,
  onSelect,
}: CropPaletteProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-4 backdrop-blur-xl">
      <h2 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">
        Culturas
      </h2>
      <p className="px-1 pb-3 text-[10px] text-gray-500">
        % de adequação às condições atuais do terreno
      </p>
      <div className="grid grid-cols-2 gap-2">
        {CROPS.map((crop) => {
          const active = activeTool === crop.id;
          const score = Math.round(
            cropSuitability(crop.id, conditions) * 100,
          );
          return (
            <button
              key={crop.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(crop.id)}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-sm transition ${
                active
                  ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-gray-300 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-base leading-none">{crop.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">
                  {crop.name}
                </span>
                <span
                  className={`mt-0.5 inline-block rounded-full px-1.5 text-[10px] font-semibold ${badgeClass(score)}`}
                >
                  {score}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-pressed={activeTool === ERASER_TOOL}
        onClick={() => onSelect(ERASER_TOOL)}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
          activeTool === ERASER_TOOL
            ? "border-red-400/60 bg-red-500/15 text-white"
            : "border-white/[0.06] bg-white/[0.02] text-gray-300 hover:bg-white/[0.06]"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 21h10M5 11l6-6 8 8-6 6H9l-4-4z"
          />
        </svg>
        Remover
      </button>
    </div>
  );
}
