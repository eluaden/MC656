import { CostItem } from "../types";

/**
 * Calcula o custo total de um item de custo com base no seu tipo de quantidade.
 *
 * - "fixed": custo = preço unitário × quantidade (independe da área)
 * - "per_area": custo = preço unitário × quantidade por unidade de área × área total
 */
export function calculateItemCost(item: CostItem, area: number): number {
  if (item.quantityType === "fixed") {
    return item.pricePerUnit * item.quantityPerAreaUnit;
  }
  return item.pricePerUnit * item.quantityPerAreaUnit * area;
}
