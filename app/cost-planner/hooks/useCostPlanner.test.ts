import { renderHook, act } from "@testing-library/react";
import { useCostPlanner } from "./useCostPlanner";
import { CostItem, SectionType } from "../types";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe("useCostPlanner", () => {
  // ==================== Default State ====================

  describe("default state", () => {
    it("initializes with default global parameters", () => {
      const { result } = renderHook(() => useCostPlanner());
      expect(result.current.state.globalParameters.crop).toBe("Soja");
      expect(result.current.state.globalParameters.area).toBe(100);
      expect(result.current.state.globalParameters.areaUnit).toBe("hectares");
      expect(result.current.state.globalParameters.currency.code).toBe("BRL");
    });

    it("initializes with 8 default items", () => {
      const { result } = renderHook(() => useCostPlanner());
      expect(result.current.state.items).toHaveLength(8);
    });

    it("has items in all 4 sections", () => {
      const { result } = renderHook(() => useCostPlanner());
      const sections = new Set(result.current.state.items.map((i) => i.section));
      expect(sections).toEqual(new Set(["Preparo", "Plantio", "Manejo", "Colheita"]));
    });
  });

  // ==================== addItem ====================

  describe("addItem", () => {
    it("adds a new item to the specified section", () => {
      const { result } = renderHook(() => useCostPlanner());
      const initialCount = result.current.state.items.length;

      act(() => {
        result.current.addItem("Preparo", {
          section: "Preparo",
          name: "Novo Insumo",
          costCategory: "Insumos",
          pricePerUnit: 50,
          quantityPerAreaUnit: 10,
          unit: "kg",
        });
      });

      expect(result.current.state.items).toHaveLength(initialCount + 1);
      const newItem = result.current.state.items.find((i) => i.name === "Novo Insumo");
      expect(newItem).toBeDefined();
      expect(newItem!.section).toBe("Preparo");
      expect(newItem!.pricePerUnit).toBe(50);
    });

    it("generates a unique id for the new item", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.addItem("Plantio", {
          section: "Plantio",
          name: "Item A",
          costCategory: "Insumos",
          pricePerUnit: 10,
          quantityPerAreaUnit: 5,
          unit: "L",
        });
      });

      act(() => {
        result.current.addItem("Plantio", {
          section: "Plantio",
          name: "Item B",
          costCategory: "Insumos",
          pricePerUnit: 20,
          quantityPerAreaUnit: 3,
          unit: "L",
        });
      });

      const itemA = result.current.state.items.find((i) => i.name === "Item A");
      const itemB = result.current.state.items.find((i) => i.name === "Item B");
      expect(itemA!.id).not.toBe(itemB!.id);
    });
  });

  // ==================== updateItem ====================

  describe("updateItem", () => {
    it("updates the price of an existing item", () => {
      const { result } = renderHook(() => useCostPlanner());
      const firstItem = result.current.state.items[0];

      act(() => {
        result.current.updateItem(firstItem.id, { pricePerUnit: 999 });
      });

      const updated = result.current.state.items.find((i) => i.id === firstItem.id);
      expect(updated!.pricePerUnit).toBe(999);
    });

    it("updates the quantity of an existing item", () => {
      const { result } = renderHook(() => useCostPlanner());
      const firstItem = result.current.state.items[0];

      act(() => {
        result.current.updateItem(firstItem.id, { quantityPerAreaUnit: 5000 });
      });

      const updated = result.current.state.items.find((i) => i.id === firstItem.id);
      expect(updated!.quantityPerAreaUnit).toBe(5000);
    });

    it("does not affect other items", () => {
      const { result } = renderHook(() => useCostPlanner());
      const [first, second] = result.current.state.items;
      const originalSecondPrice = second.pricePerUnit;

      act(() => {
        result.current.updateItem(first.id, { pricePerUnit: 999 });
      });

      const secondAfter = result.current.state.items.find((i) => i.id === second.id);
      expect(secondAfter!.pricePerUnit).toBe(originalSecondPrice);
    });
  });

  // ==================== deleteItem ====================

  describe("deleteItem", () => {
    it("removes the item with the given id", () => {
      const { result } = renderHook(() => useCostPlanner());
      const firstItem = result.current.state.items[0];
      const initialCount = result.current.state.items.length;

      act(() => {
        result.current.deleteItem(firstItem.id);
      });

      expect(result.current.state.items).toHaveLength(initialCount - 1);
      expect(result.current.state.items.find((i) => i.id === firstItem.id)).toBeUndefined();
    });

    it("does not remove other items", () => {
      const { result } = renderHook(() => useCostPlanner());
      const [first, second] = result.current.state.items;

      act(() => {
        result.current.deleteItem(first.id);
      });

      expect(result.current.state.items.find((i) => i.id === second.id)).toBeDefined();
    });
  });

  // ==================== updateGlobalParameters ====================

  describe("updateGlobalParameters", () => {
    it("updates the crop", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ crop: "Café" });
      });

      expect(result.current.state.globalParameters.crop).toBe("Café");
    });

    it("updates the area", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ area: 200 });
      });

      expect(result.current.state.globalParameters.area).toBe(200);
    });

    it("updates the area unit", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "m²" });
      });

      expect(result.current.state.globalParameters.areaUnit).toBe("m²");
    });

    it("preserves other parameters when updating one", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ crop: "Café" });
      });

      expect(result.current.state.globalParameters.area).toBe(100);
      expect(result.current.state.globalParameters.areaUnit).toBe("hectares");
    });
  });

  // ==================== clearForm ====================

  describe("clearForm", () => {
    it("resets state to defaults after modifications", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ crop: "Café", area: 500 });
        result.current.deleteItem(result.current.state.items[0].id);
      });

      act(() => {
        result.current.clearForm();
      });

      expect(result.current.state.globalParameters.crop).toBe("Soja");
      expect(result.current.state.globalParameters.area).toBe(100);
      expect(result.current.state.items).toHaveLength(8);
    });
  });

  // ==================== calculateItemCost ====================

  describe("calculateItemCost", () => {
    it("calculates cost as pricePerUnit × quantityPerAreaUnit × area", () => {
      const { result } = renderHook(() => useCostPlanner());

      const testItem: CostItem = {
        id: "test",
        section: "Preparo",
        name: "Test",
        costCategory: "Insumos",
        pricePerUnit: 10,
        quantityPerAreaUnit: 5,
        unit: "kg",
      };

      const cost = result.current.calculateItemCost(testItem);
      expect(cost).toBe(10 * 5 * 100);
    });

    it("recalculates when area changes", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ area: 50 });
      });

      const testItem: CostItem = {
        id: "test",
        section: "Preparo",
        name: "Test",
        costCategory: "Insumos",
        pricePerUnit: 10,
        quantityPerAreaUnit: 5,
        unit: "kg",
      };

      const cost = result.current.calculateItemCost(testItem);
      expect(cost).toBe(10 * 5 * 50); // 2500
    });
  });

  // ==================== calculateTotals ====================

  describe("totals (calculateTotals)", () => {
    it("computes totalCost as sum of all item costs", () => {
      const { result } = renderHook(() => useCostPlanner());
      const { totals, state } = result.current;

      let expectedTotal = 0;
      state.items.forEach((item) => {
        expectedTotal += item.pricePerUnit * item.quantityPerAreaUnit * state.globalParameters.area;
      });

      expect(totals.totalCost).toBe(expectedTotal);
    });

    it("computes costPerAreaUnit as totalCost / area", () => {
      const { result } = renderHook(() => useCostPlanner());
      const { totals } = result.current;

      expect(totals.costPerAreaUnit).toBe(totals.totalCost / 100);
    });

    it("computes section totals correctly", () => {
      const { result } = renderHook(() => useCostPlanner());
      const { totals, state } = result.current;

      const preparoItems = state.items.filter((i) => i.section === "Preparo");
      let expectedPreparo = 0;
      preparoItems.forEach((item) => {
        expectedPreparo += item.pricePerUnit * item.quantityPerAreaUnit * state.globalParameters.area;
      });

      expect(totals.sectionTotals["Preparo"]).toBe(expectedPreparo);
    });

    it("computes category totals correctly", () => {
      const { result } = renderHook(() => useCostPlanner());
      const { totals, state } = result.current;

      const insumosItems = state.items.filter((i) => i.costCategory === "Insumos");
      let expectedInsumos = 0;
      insumosItems.forEach((item) => {
        expectedInsumos += item.pricePerUnit * item.quantityPerAreaUnit * state.globalParameters.area;
      });

      expect(totals.categoryTotals["Insumos"]).toBe(expectedInsumos);
    });

    it("returns zero costPerAreaUnit when area is zero", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ area: 0 });
      });

      expect(result.current.totals.costPerAreaUnit).toBe(0);
    });

    it("returns zero totals when all items are deleted", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        const ids = result.current.state.items.map((i) => i.id);
        ids.forEach((id) => result.current.deleteItem(id));
      });

      expect(result.current.totals.totalCost).toBe(0);
      expect(result.current.totals.costPerAreaUnit).toBe(0);
    });
  });

  // ==================== getItemsBySection ====================

  describe("getItemsBySection", () => {
    it("returns only items from the specified section", () => {
      const { result } = renderHook(() => useCostPlanner());

      const preparoItems = result.current.getItemsBySection("Preparo");
      expect(preparoItems.length).toBeGreaterThan(0);
      preparoItems.forEach((item) => {
        expect(item.section).toBe("Preparo");
      });
    });

    it("returns empty array for section with no items", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        const colheitaItems = result.current.state.items.filter((i) => i.section === "Colheita");
        colheitaItems.forEach((item) => result.current.deleteItem(item.id));
      });

      const colheitaItems = result.current.getItemsBySection("Colheita");
      expect(colheitaItems).toHaveLength(0);
    });
  });
});
