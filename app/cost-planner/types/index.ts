// Tipos para o Cost Planner

export type Crop = "Soja" | "Café" | "Cana de açúcar";
export type SectionType = "Preparo" | "Plantio" | "Manejo" | "Colheita";
export type CostCategory = "Insumos" | "Mecanização" | "Mão de Obra";

export interface CostItem {
  id: string;
  section: SectionType;
  name: string;
  costCategory: CostCategory;
  pricePerUnit: number;
  quantityPerHectare: number;
  unit: string; // ex: "kg", "L", "Tonelada", "hora"
}

export interface GlobalParameters {
  crop: Crop;
  area: number; // hectares
}

export interface CostPlannerState {
  globalParameters: GlobalParameters;
  items: CostItem[];
}

export interface CalculatedCosts {
  itemTotalCost: number; // pricePerUnit × quantityPerHectare × area
  sectionTotals: Record<SectionType, number>;
  categoryTotals: Record<CostCategory, number>;
  totalCost: number;
  costPerHectare: number;
}

export interface SectionConfig {
  id: SectionType;
  label: string;
  description: string;
}
