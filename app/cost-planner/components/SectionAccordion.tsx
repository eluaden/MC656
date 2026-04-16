"use client";

import React from "react";
import { SectionType, CostItem, CurrencyConfig } from "../types";
import { Accordion } from "./Accordion";
import { CostItemForm } from "./CostItemForm";
import { formatCurrency } from "../utils/formatCurrency";

interface SectionAccordionProps {
  sectionId: SectionType;
  sectionLabel: string;
  sectionDescription: string;
  items: CostItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
  onDeleteItem: (id: string) => void;
  area: number;
  areaUnitLabel: string;
  sectionTotal: number;
  currency: CurrencyConfig;
}

export function SectionAccordion({
  sectionId,
  sectionLabel,
  sectionDescription,
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  area,
  areaUnitLabel,
  sectionTotal,
  currency,
}: SectionAccordionProps) {
  return (
    <Accordion
      id={sectionId}
      title={sectionLabel}
      description={`${items.length} item(s) • ${formatCurrency(sectionTotal, currency)}`}
      isDefaultOpen={sectionId === "Preparo"}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-300">{sectionDescription}</p>

        <div className="space-y-3">
          {items.map((item) => (
            <CostItemForm
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              area={area}
              areaUnitLabel={areaUnitLabel}
              currency={currency}
            />
          ))}
        </div>

        <button
          onClick={onAddItem}
          className="w-full px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span>+</span>
          <span>Adicionar Item</span>
        </button>
      </div>
    </Accordion>
  );
}
