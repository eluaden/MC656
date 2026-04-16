import { renderHook, act } from "@testing-library/react";
import { useCostPlanner } from "./useCostPlanner";
import { CostItem } from "../types";

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
          quantityType: "per_area",
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
          quantityType: "per_area",
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
          quantityType: "per_area",
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
        quantityType: "per_area",
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
        quantityType: "per_area",
        unit: "kg",
      };

      const cost = result.current.calculateItemCost(testItem);
      expect(cost).toBe(10 * 5 * 50); // 2500
    });

    it("calculates fixed quantity cost without area multiplication", () => {
      const { result } = renderHook(() => useCostPlanner());

      const testItem: CostItem = {
        id: "test-fixed",
        section: "Colheita",
        name: "Máquina",
        costCategory: "Mecanização",
        pricePerUnit: 5000,
        quantityPerAreaUnit: 2,
        quantityType: "fixed",
        unit: "hora",
      };

      const cost = result.current.calculateItemCost(testItem);
      expect(cost).toBe(5000 * 2); // 10000, no area multiplication
    });
  });

  // ==================== calculateTotals ====================

  describe("totals (calculateTotals)", () => {
    it("computes totalCost as sum of all item costs", () => {
      const { result } = renderHook(() => useCostPlanner());
      const { totals, state } = result.current;

      let expectedTotal = 0;
      state.items.forEach((item) => {
        expectedTotal += result.current.calculateItemCost(item);
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
        expectedPreparo += result.current.calculateItemCost(item);
      });

      expect(totals.sectionTotals["Preparo"]).toBe(expectedPreparo);
    });

    it("computes category totals correctly", () => {
      const { result } = renderHook(() => useCostPlanner());
      const { totals, state } = result.current;

      const insumosItems = state.items.filter((i) => i.costCategory === "Insumos");
      let expectedInsumos = 0;
      insumosItems.forEach((item) => {
        expectedInsumos += result.current.calculateItemCost(item);
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

  // ==================== Area Unit Conversion ====================

  describe("area unit conversion", () => {
    it("converts area from hectares to m² (×10000)", () => {
      const { result } = renderHook(() => useCostPlanner());
      expect(result.current.state.globalParameters.area).toBe(100);

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "m²" });
      });

      expect(result.current.state.globalParameters.area).toBe(1000000);
      expect(result.current.state.globalParameters.areaUnit).toBe("m²");
    });

    it("converts area from m² to hectares (÷10000)", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "m²" });
      });

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "hectares" });
      });

      expect(result.current.state.globalParameters.area).toBe(100);
      expect(result.current.state.globalParameters.areaUnit).toBe("hectares");
    });

    it("converts per_area item quantities when switching units", () => {
      const { result } = renderHook(() => useCostPlanner());
      const firstItem = result.current.state.items[0];
      const originalQty = firstItem.quantityPerAreaUnit; // 2000 kg/ha

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "m²" });
      });

      const converted = result.current.state.items.find((i) => i.id === firstItem.id);
      expect(converted!.quantityPerAreaUnit).toBe(originalQty / 10000); // 0.2 kg/m²
    });

    it("does NOT convert fixed quantity items when switching units", () => {
      const { result } = renderHook(() => useCostPlanner());

      act(() => {
        result.current.addItem("Colheita", {
          section: "Colheita",
          name: "Trator",
          costCategory: "Mecanização",
          pricePerUnit: 50000,
          quantityPerAreaUnit: 2,
          quantityType: "fixed",
          unit: "unidade",
        });
      });

      const trator = result.current.state.items.find((i) => i.name === "Trator");
      expect(trator!.quantityPerAreaUnit).toBe(2);

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "m²" });
      });

      const tratorAfter = result.current.state.items.find((i) => i.name === "Trator");
      expect(tratorAfter!.quantityPerAreaUnit).toBe(2); // unchanged
    });

    it("preserves total cost after unit conversion (round-trip)", () => {
      const { result } = renderHook(() => useCostPlanner());
      const totalBefore = result.current.totals.totalCost;

      act(() => {
        result.current.updateGlobalParameters({ areaUnit: "m²" });
      });

      const totalAfter = result.current.totals.totalCost;
      expect(totalAfter).toBeCloseTo(totalBefore, 0);
    });
  });

  // ==================== localStorage Migration ====================

  describe("localStorage migration", () => {
    it("migrates old quantityPerHectare to quantityPerAreaUnit", () => {
      const oldState = {
        globalParameters: { crop: "Soja", area: 50, areaUnit: "hectares" },
        items: [
          {
            id: "old-1",
            section: "Preparo",
            name: "Old Item",
            costCategory: "Insumos",
            pricePerUnit: 100,
            quantityPerHectare: 500,
            unit: "kg",
          },
        ],
      };
      localStorageMock.setItem("costPlannerState", JSON.stringify(oldState));

      const { result } = renderHook(() => useCostPlanner());

      // Wait for useEffect to load
      act(() => {});

      const item = result.current.state.items.find((i) => i.id === "old-1");
      expect(item).toBeDefined();
      expect(item!.quantityPerAreaUnit).toBe(500);
    });

    it("defaults quantityType to per_area for old items", () => {
      const oldState = {
        globalParameters: { crop: "Café", area: 10, areaUnit: "hectares" },
        items: [
          {
            id: "old-2",
            section: "Manejo",
            name: "Old Fungicida",
            costCategory: "Insumos",
            pricePerUnit: 80,
            quantityPerAreaUnit: 3,
            unit: "L",
          },
        ],
      };
      localStorageMock.setItem("costPlannerState", JSON.stringify(oldState));

      const { result } = renderHook(() => useCostPlanner());
      act(() => {});

      const item = result.current.state.items.find((i) => i.id === "old-2");
      expect(item!.quantityType).toBe("per_area");
    });

    it("defaults currency to BRL when missing from saved state", () => {
      const oldState = {
        globalParameters: { crop: "Soja", area: 100, areaUnit: "hectares" },
        items: [],
      };
      localStorageMock.setItem("costPlannerState", JSON.stringify(oldState));

      const { result } = renderHook(() => useCostPlanner());
      act(() => {});

      expect(result.current.state.globalParameters.currency.code).toBe("BRL");
      expect(result.current.state.globalParameters.currency.symbol).toBe("R$");
    });
  });
});
