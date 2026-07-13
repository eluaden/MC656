import { CostItem } from "../types";

export function calculateItemCost(item: CostItem, area: number): number {
  if (item.quantityType === "fixed") {
    return item.pricePerUnit * item.quantityPerAreaUnit;
  }
  return item.pricePerUnit * item.quantityPerAreaUnit * area;
}
