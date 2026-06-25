"use client";

import { getCrop } from "../data/crops";
import { GridState } from "../types";

type CropGridProps = {
  state: GridState;
  onCellPointerDown: (index: number) => void;
  onCellPointerEnter: (index: number) => void;
};

export function CropGrid({
  state,
  onCellPointerDown,
  onCellPointerEnter,
}: CropGridProps) {
  const { rows, cols, cells } = state;

  return (
    <div className="flex justify-center overflow-x-auto">
      <div
        className="grid select-none gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, 2.5rem)`,
          touchAction: "none",
        }}
        role="grid"
        aria-label={`Terreno ${rows} por ${cols}`}
      >
        {cells.map((cropId, index) => {
          const crop = getCrop(cropId);
          const row = Math.floor(index / cols) + 1;
          const col = (index % cols) + 1;
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={
                crop
                  ? `Linha ${row}, coluna ${col}: ${crop.name}`
                  : `Linha ${row}, coluna ${col}: vazia`
              }
              onPointerDown={(e) => {
                e.preventDefault();
                onCellPointerDown(index);
              }}
              onPointerEnter={() => onCellPointerEnter(index)}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-lg transition-colors ${
                crop
                  ? `${crop.cellClass} border-white/20 hover:brightness-110`
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.08]"
              }`}
            >
              {crop ? <span aria-hidden="true">{crop.emoji}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
