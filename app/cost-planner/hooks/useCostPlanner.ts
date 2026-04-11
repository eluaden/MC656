"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CostPlannerState,
  CostItem,
  GlobalParameters,
  CalculatedCosts,
  Crop,
  SectionType,
  CostCategory,
  AreaUnit,
} from "../types";

const STORAGE_KEY = "costPlannerState";

const DEFAULT_STATE: CostPlannerState = {
  globalParameters: {
    crop: "Soja" as Crop,
    area: 100,
    areaUnit: "hectares" as AreaUnit,
  },
  items: getDefaultItems(),
};

export function useCostPlanner() {
  const [state, setState] = useState<CostPlannerState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        // corrupted data, keep defaults
      }
    }
    setIsLoaded(true);
  }, []);

  // Auto-save to localStorage whenever state changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // ==================== Cálculos ====================

  const calculateItemCost = useCallback(
    (item: CostItem): number => {
      return item.pricePerUnit * item.quantityPerHectare * state.globalParameters.area;
    },
    [state.globalParameters.area]
  );

  const calculateTotals = useCallback((): CalculatedCosts => {
    const sectionTotals: Record<SectionType, number> = {
      Preparo: 0,
      Plantio: 0,
      Manejo: 0,
      Colheita: 0,
    };

    const categoryTotals: Record<CostCategory, number> = {
      Insumos: 0,
      Mecanização: 0,
      "Mão de Obra": 0,
    };

    let totalCost = 0;

    state.items.forEach((item) => {
      const itemCost = calculateItemCost(item);
      sectionTotals[item.section] += itemCost;
      categoryTotals[item.costCategory] += itemCost;
      totalCost += itemCost;
    });

    const costPerHectare =
      state.globalParameters.area > 0
        ? totalCost / state.globalParameters.area
        : 0;

    return {
      itemTotalCost: 0,
      sectionTotals,
      categoryTotals,
      totalCost,
      costPerHectare,
    };
  }, [state.items, state.globalParameters.area, calculateItemCost]);

  // ==================== Operações de Item ====================

  const addItem = useCallback(
    (section: SectionType, item: Omit<CostItem, "id">) => {
      const newItem: CostItem = {
        ...item,
        id: `${Date.now()}-${Math.random()}`,
      };
      setState((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    },
    []
  );

  const updateItem = useCallback((id: string, updates: Partial<CostItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }, []);

  // ==================== Parâmetros Globais ====================

  const updateGlobalParameters = useCallback(
    (updates: Partial<GlobalParameters>) => {
      setState((prev) => ({
        ...prev,
        globalParameters: {
          ...prev.globalParameters,
          ...updates,
        },
      }));
    },
    []
  );

  // ==================== Persistência ====================

  const saveProject = useCallback(() => {
    // State is auto-saved, but this can be used for explicit feedback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const clearForm = useCallback(() => {
    const defaults = {
      globalParameters: {
        crop: "Soja" as Crop,
        area: 100,
        areaUnit: "hectares" as AreaUnit,
      },
      items: getDefaultItems()
    };
    setState(defaults);
  }, []);

  // ==================== Acesso aos dados ====================

  const getItemsBySection = useCallback(
    (section: SectionType): CostItem[] => {
      return state.items.filter((item) => item.section === section);
    },
    [state.items]
  );

  const totals = calculateTotals();

  return {
    // Estado
    state,
    // Cálculos
    totals,
    calculateItemCost,
    // Operações de item
    addItem,
    updateItem,
    deleteItem,
    getItemsBySection,
    // Parâmetros globais
    updateGlobalParameters,
    // Persistência
    saveProject,
    clearForm,
  };
}

// ==================== Dados Padrão ====================

function getDefaultItems(): CostItem[] {
  return [
    {
      id: "1",
      section: "Preparo",
      name: "Calcário",
      costCategory: "Insumos",
      pricePerUnit: 150,
      quantityPerHectare: 2000,
      unit: "kg",
    },
    {
      id: "2",
      section: "Preparo",
      name: "Gesso",
      costCategory: "Insumos",
      pricePerUnit: 120,
      quantityPerHectare: 1000,
      unit: "kg",
    },
    {
      id: "3",
      section: "Plantio",
      name: "Sementes",
      costCategory: "Insumos",
      pricePerUnit: 400,
      quantityPerHectare: 50,
      unit: "kg",
    },
    {
      id: "4",
      section: "Plantio",
      name: "Herbicida Pré-plantio",
      costCategory: "Insumos",
      pricePerUnit: 80,
      quantityPerHectare: 2,
      unit: "L",
    },
    {
      id: "5",
      section: "Manejo",
      name: "Fertilizante NPK",
      costCategory: "Insumos",
      pricePerUnit: 3.5,
      quantityPerHectare: 200,
      unit: "kg",
    },
    {
      id: "6",
      section: "Manejo",
      name: "Fungicida",
      costCategory: "Insumos",
      pricePerUnit: 100,
      quantityPerHectare: 1.5,
      unit: "L",
    },
    {
      id: "7",
      section: "Colheita",
      name: "Máquina Colheitadeira",
      costCategory: "Mecanização",
      pricePerUnit: 200,
      quantityPerHectare: 1,
      unit: "hora",
    },
    {
      id: "8",
      section: "Colheita",
      name: "Mão de Obra Colheita",
      costCategory: "Mão de Obra",
      pricePerUnit: 50,
      quantityPerHectare: 2,
      unit: "pessoa-dia",
    },
  ];
}
