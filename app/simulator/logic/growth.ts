// Modelo de crescimento do simulador: combina as condições do terreno
// (temperatura do ar e pH do solo) com os limiares ECOCROP de cada cultura
// para definir a velocidade de crescimento e o estágio visual de cada planta.

import { CROP_TABLE, suitability } from "../../api/crop/crop-utils";
import { FieldConditions, GrowthStage } from "../types";

/** Abaixo desta adequação a planta não se desenvolve: fica murcha. */
export const WITHER_THRESHOLD = 0.05;

/** Progresso máximo que uma planta murcha alcança antes de estagnar. */
export const WITHERED_MAX_PROGRESS = 0.2;

/**
 * Fração da velocidade ótima mantida mesmo em adequação zero de crescimento
 * (evita que uma cultura "média" pareça congelada).
 */
const BASE_GROWTH_RATE = 0.25;

const ECOCROP_BY_ID = new Map(CROP_TABLE.map((crop) => [crop.id, crop]));

/**
 * Adequação (0..1) de uma cultura às condições do terreno, pelo mesmo modelo
 * trapezoidal ECOCROP da recomendação: produto dos fatores de temperatura e pH.
 * Culturas fora da tabela recebem adequação neutra (1).
 */
export function cropSuitability(
  cropId: string,
  conditions: FieldConditions,
): number {
  const ecocrop = ECOCROP_BY_ID.get(cropId);
  if (!ecocrop) return 1;
  const tempFactor = suitability(conditions.temperature, ecocrop.temp) ?? 1;
  const phFactor = suitability(conditions.ph, ecocrop.ph) ?? 1;
  return tempFactor * phFactor;
}

/**
 * Progresso de crescimento (0..1) de uma planta.
 * A velocidade escala com a adequação; com adequação insuficiente a planta
 * estaciona em WITHERED_MAX_PROGRESS (murcha).
 */
export function growthProgress(
  elapsedDays: number,
  cycleDays: number,
  suit: number,
): number {
  if (elapsedDays <= 0) return 0;
  const rate = BASE_GROWTH_RATE + (1 - BASE_GROWTH_RATE) * suit;
  const raw = (elapsedDays * rate) / cycleDays;
  if (suit < WITHER_THRESHOLD) {
    return Math.min(raw, WITHERED_MAX_PROGRESS);
  }
  return Math.min(raw, 1);
}

/** Estágio visual correspondente a um progresso, considerando a adequação. */
export function growthStage(progress: number, suit: number): GrowthStage {
  if (suit < WITHER_THRESHOLD && progress >= WITHERED_MAX_PROGRESS) {
    return "murcha";
  }
  if (progress < 0.12) return "semente";
  if (progress < 0.45) return "broto";
  if (progress < 1) return "crescimento";
  return "colheita";
}

export const STAGE_LABELS: Record<GrowthStage, string> = {
  semente: "Semente",
  broto: "Broto",
  crescimento: "Em crescimento",
  colheita: "Pronta para colheita",
  murcha: "Murcha (condições ruins)",
};
