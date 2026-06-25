export type Crop = {
  id: string;
  name: string;
  emoji: string;
  /** Tailwind background classes used to paint a planted cell. */
  cellClass: string;
};

/** Special palette tool that clears a cell instead of planting. */
export const ERASER_TOOL = "eraser";

export type Tool = string;

export type GridState = {
  rows: number;
  cols: number;
  /** Flat row-major array of length rows*cols; each entry is a crop id or null. */
  cells: (string | null)[];
};
