import { Crop } from "../types";

export const CROPS: Crop[] = [
  { id: "soja", name: "Soja", emoji: "🌱", cellClass: "bg-emerald-600/80" },
  { id: "milho", name: "Milho", emoji: "🌽", cellClass: "bg-amber-500/80" },
  { id: "trigo", name: "Trigo", emoji: "🌾", cellClass: "bg-yellow-600/80" },
  { id: "cafe", name: "Café", emoji: "☕", cellClass: "bg-orange-800/80" },
  { id: "uva", name: "Uva", emoji: "🍇", cellClass: "bg-purple-600/80" },
  { id: "tomate", name: "Tomate", emoji: "🍅", cellClass: "bg-red-600/80" },
  { id: "cana", name: "Cana", emoji: "🎋", cellClass: "bg-lime-600/80" },
  { id: "algodao", name: "Algodão", emoji: "🤍", cellClass: "bg-slate-300/80" },
];

const CROP_BY_ID = new Map(CROPS.map((crop) => [crop.id, crop]));

export function getCrop(id: string | null): Crop | undefined {
  if (!id) return undefined;
  return CROP_BY_ID.get(id);
}
