"use client";

import { CROPS } from "../data/crops";
import { ERASER_TOOL, Tool } from "../types";

type CropPaletteProps = {
  activeTool: Tool;
  onSelect: (tool: Tool) => void;
};

export function CropPalette({ activeTool, onSelect }: CropPaletteProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-xl">
      <h2 className="px-1 pb-3 text-xs font-semibold uppercase tracking-wide text-emerald-400">
        Culturas
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {CROPS.map((crop) => {
          const active = activeTool === crop.id;
          return (
            <button
              key={crop.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(crop.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                active
                  ? "border-emerald-400/60 bg-emerald-500/15 text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-gray-300 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-base leading-none">{crop.emoji}</span>
              <span className="truncate font-medium">{crop.name}</span>
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
