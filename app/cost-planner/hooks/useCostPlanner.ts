"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CostPlannerState,
  CostItem,
  GlobalParameters,
  CalculatedCosts,
  SectionType,
  CostCategory,
  AreaUnit,
  CurrencyConfig,
} from "../types";

const STORAGE_KEY = "costPlannerState";

const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "BRL",
  symbol: "R$",
  locale: "pt-BR",
  decimalPlaces: 2,
};

const DEFAULT_STATE: CostPlannerState = {
  globalParameters: {
    crop: "Soja",
    area: 100,
    areaUnit: "hectares" as AreaUnit,
    currency: DEFAULT_CURRENCY,
  },
  items: getDefaultItems(),
};

export function useCostPlanner() {
  const [state, setState] = useState<CostPlannerState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        // Mesclar com valores padrão para garantir que propriedades novas existam
        const mergedState: CostPlannerState = {
          globalParameters: {
            ...DEFAULT_STATE.globalParameters,
            ...parsedState.globalParameters,
            // Garantir que currency tenha valores padrão se não existir
            currency: parsedState.globalParameters?.currency || DEFAULT_CURRENCY,
          },
          items: parsedState.items || [],
        };
        setState(mergedState);
      } catch {
        // Se houver erro ao parsear, usar DEFAULT_STATE
        setState(DEFAULT_STATE);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // ==================== Cálculos ====================

  const calculateItemCost = useCallback(
    (item: CostItem): number => {
      return item.pricePerUnit * item.quantityPerAreaUnit * state.globalParameters.area;
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

    const costPerAreaUnit =
      state.globalParameters.area > 0
        ? totalCost / state.globalParameters.area
        : 0;

    return {
      itemTotalCost: 0,
      sectionTotals,
      categoryTotals,
      totalCost,
      costPerAreaUnit,
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
      setState((prev) => {
        let newState = {
          ...prev,
          globalParameters: {
            ...prev.globalParameters,
            ...updates,
          },
        };

        // Se a unidade de área mudou, converter as quantidades de insumos
        if (
          updates.areaUnit &&
          updates.areaUnit !== prev.globalParameters.areaUnit
        ) {
          const oldUnit = prev.globalParameters.areaUnit;
          const newUnit = updates.areaUnit;

          // Função para truncar a 10^-6 (6 casas decimais)
          const truncate = (value: number): number => {
            return Math.trunc(value * 1e6) / 1e6;
          };

          // Determinar fator de conversão
          let conversionFactor: number;
          if (oldUnit === "hectares" && newUnit === "m²") {
            // De hectares para m²: dividir por 10000
            conversionFactor = 1 / 10000;
          } else if (oldUnit === "m²" && newUnit === "hectares") {
            // De m² para hectares: multiplicar por 10000
            conversionFactor = 10000;
          } else {
            conversionFactor = 1;
          }

          // Converter apenas as quantidades de INSUMOS
          newState.items = prev.items.map((item) => ({
            ...item,
            quantityPerAreaUnit:
              item.costCategory === "Insumos"
                ? truncate(item.quantityPerAreaUnit * conversionFactor)
                : item.quantityPerAreaUnit,
          }));
        }

        return newState;
      });
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
        crop: "Soja",
        area: 100,
        areaUnit: "hectares" as AreaUnit,
        currency: DEFAULT_CURRENCY,
      },
      items: getDefaultItems(),
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
    state,
    totals,
    calculateItemCost,
    addItem,
    updateItem,
    deleteItem,
    getItemsBySection,
    updateGlobalParameters,
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
      quantityPerAreaUnit: 2000,
      unit: "kg",
    },
    {
      id: "2",
      section: "Preparo",
      name: "Gesso",
      costCategory: "Insumos",
      pricePerUnit: 120,
      quantityPerAreaUnit: 1000,
      unit: "kg",
    },
    {
      id: "3",
      section: "Plantio",
      name: "Sementes",
      costCategory: "Insumos",
      pricePerUnit: 400,
      quantityPerAreaUnit: 50,
      unit: "kg",
    },
    {
      id: "4",
      section: "Plantio",
      name: "Herbicida Pré-plantio",
      costCategory: "Insumos",
      pricePerUnit: 80,
      quantityPerAreaUnit: 2,
      unit: "L",
    },
    {
      id: "5",
      section: "Manejo",
      name: "Fertilizante NPK",
      costCategory: "Insumos",
      pricePerUnit: 3.5,
      quantityPerAreaUnit: 200,
      unit: "kg",
    },
    {
      id: "6",
      section: "Manejo",
      name: "Fungicida",
      costCategory: "Insumos",
      pricePerUnit: 100,
      quantityPerAreaUnit: 1.5,
      unit: "L",
    },
    {
      id: "7",
      section: "Colheita",
      name: "Máquina Colheitadeira",
      costCategory: "Mecanização",
      pricePerUnit: 200,
      quantityPerAreaUnit: 1,
      unit: "hora",
    },
    {
      id: "8",
      section: "Colheita",
      name: "Mão de Obra Colheita",
      costCategory: "Mão de Obra",
      pricePerUnit: 50,
      quantityPerAreaUnit: 2,
      unit: "pessoa-dia",
    },
  ];
}
