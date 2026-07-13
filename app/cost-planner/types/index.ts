// Tipos para o Cost Planner

export type AreaUnit = "hectares" | "m²";
export type SectionType = "Preparo" | "Plantio" | "Manejo" | "Colheita";
export type CostCategory = "Insumos" | "Mecanização" | "Mão de Obra";
export type CurrencyCode = "BRL" | "USD" | "EUR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

export type QuantityType = "per_area" | "fixed";

export interface CostItem {
  id: string;
  section: SectionType;
  name: string;
  costCategory: CostCategory;
  pricePerUnit: number;
  quantityPerAreaUnit: number;
  quantityType: QuantityType;
  unit: string; // ex: "kg", "L", "Tonelada", "hora"
}

export interface GlobalParameters {
  crop: string; // Customizável pelo usuário
  area: number;
  areaUnit: AreaUnit;
  currency: CurrencyConfig;
}

export interface CostPlannerState {
  globalParameters: GlobalParameters;
  items: CostItem[];
}

export interface CalculatedCosts {
  itemTotalCost: number; // pricePerUnit × quantityPerAreaUnit × area
  sectionTotals: Record<SectionType, number>;
  categoryTotals: Record<CostCategory, number>;
  totalCost: number;
  costPerAreaUnit: number;
}

export interface SectionConfig {
  id: SectionType;
  label: string;
  description: string;
}

/** Agrupa os dados de exibição relacionados a área e moeda */
export interface DisplayContext {
  area: number;
  areaUnitLabel: string;
  currency: CurrencyConfig;
}

/** Agrupa os callbacks de operação sobre itens */
export interface ItemActions {
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<CostItem>) => void;
  onDelete: (id: string) => void;
}
