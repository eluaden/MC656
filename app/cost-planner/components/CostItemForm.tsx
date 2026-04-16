"use client";

import React from "react";
import { CostItem, CurrencyConfig } from "../types";
import { NumericInput } from "./NumericInput";
import { formatCurrency } from "../utils/formatCurrency";

interface CostItemFormProps {
  item: CostItem;
  onUpdate: (id: string, updates: Partial<CostItem>) => void;
  onDelete: (id: string) => void;
  area: number;
  areaUnitLabel: string;
  currency: CurrencyConfig;
}

export function CostItemForm({
  item,
  onUpdate,
  onDelete,
  area,
  areaUnitLabel,
  currency,
}: CostItemFormProps) {
  const itemCost = item.quantityType === "fixed"
    ? item.pricePerUnit * item.quantityPerAreaUnit
    : item.pricePerUnit * item.quantityPerAreaUnit * area;

  return (
    <div className="p-3 bg-gray-900 border border-gray-800 rounded-lg space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-medium text-white">{item.name}</h4>
          <p className="text-xs text-gray-400">
            {item.costCategory} • {item.unit}
          </p>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="px-2 py-1 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded border border-red-500/30 transition"
        >
          Remover
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumericInput
          label="Preço Unitário"
          value={item.pricePerUnit}
          onChange={(value) => onUpdate(item.id, { pricePerUnit: value })}
          suffix={currency.symbol}
          min={0}
          step={0.01}
        />
        <NumericInput
          label={item.quantityType === "fixed" ? `Qtd total (${item.unit})` : `Qtd por ${areaUnitLabel} (${item.unit})`}
          value={item.quantityPerAreaUnit}
          onChange={(value) =>
            onUpdate(item.id, { quantityPerAreaUnit: value })
          }
          min={0}
          step={0.01}
        />
      </div>

      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
        <p className="text-xs text-gray-300">
          Custo Total:{" "}
          <span className="font-semibold text-emerald-300">
            {formatCurrency(itemCost, currency)}
          </span>
        </p>
      </div>
    </div>
  );
}
