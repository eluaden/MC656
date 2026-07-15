import { Crop } from "../types";

// Mesmas culturas da tabela ECOCROP usada na recomendação (app/api/crop/crop-utils.ts),
// para que a adequação clima+solo do simulador use os limiares da FAO.
// cycleDays aproxima o ciclo típico de crescimento (GMIN–GMAX do Ecocrop).
export const CROPS: Crop[] = [
  { id: "soja", name: "Soja", emoji: "🌱", cycleDays: 120, matureHeight: 0.55, foliageColor: 0x3f9e4d, fruitColor: 0x9ccc65 },
  { id: "milho", name: "Milho", emoji: "🌽", cycleDays: 125, matureHeight: 1.05, foliageColor: 0x4caf50, fruitColor: 0xffd54f },
  { id: "trigo", name: "Trigo", emoji: "🌾", cycleDays: 120, matureHeight: 0.7, foliageColor: 0x8bc34a, fruitColor: 0xe6c975 },
  { id: "arroz", name: "Arroz", emoji: "🍚", cycleDays: 130, matureHeight: 0.6, foliageColor: 0x66bb6a, fruitColor: 0xf5f0dc },
  { id: "feijao", name: "Feijão", emoji: "🫘", cycleDays: 95, matureHeight: 0.45, foliageColor: 0x43a047, fruitColor: 0x8d5541 },
  { id: "cafe", name: "Café", emoji: "☕", cycleDays: 300, matureHeight: 0.85, foliageColor: 0x2e7d32, fruitColor: 0xd84335 },
  { id: "cana", name: "Cana", emoji: "🎍", cycleDays: 330, matureHeight: 1.2, foliageColor: 0x7cb342, fruitColor: 0xc5e1a5 },
  { id: "mandioca", name: "Mandioca", emoji: "🥔", cycleDays: 290, matureHeight: 0.75, foliageColor: 0x558b2f, fruitColor: 0xbca789 },
  { id: "algodao", name: "Algodão", emoji: "☁️", cycleDays: 180, matureHeight: 0.6, foliageColor: 0x689f38, fruitColor: 0xf5f5f5 },
  { id: "batata", name: "Batata", emoji: "🥔", cycleDays: 110, matureHeight: 0.35, foliageColor: 0x66a03c, fruitColor: 0xd7b98e },
];

const CROP_BY_ID = new Map(CROPS.map((crop) => [crop.id, crop]));

export function getCrop(id: string | null): Crop | undefined {
  if (!id) return undefined;
  return CROP_BY_ID.get(id);
}
