"use client";

import React from "react";
import { SectionConfig, CostItem, DisplayContext, ItemActions } from "../types";
import { Accordion } from "./Accordion";
import { CostItemForm } from "./CostItemForm";
import { formatCurrency } from "../utils/formatCurrency";

interface SectionAccordionProps {
  section: SectionConfig;
  items: CostItem[];
  actions: ItemActions;
  displayContext: DisplayContext;
  sectionTotal: number;
}

export function SectionAccordion({
  section,
  items,
  actions,
  displayContext,
  sectionTotal,
}: SectionAccordionProps) {
  return (
    <Accordion
      id={section.id}
      title={section.label}
      description={`${items.length} item(s) • ${formatCurrency(sectionTotal, displayContext.currency)}`}
      isDefaultOpen={section.id === "Preparo"}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-300">{section.description}</p>

        <div className="space-y-3">
          {items.map((item) => (
            <CostItemForm
              key={item.id}
              item={item}
              onUpdate={actions.onUpdate}
              onDelete={actions.onDelete}
              area={displayContext.area}
              areaUnitLabel={displayContext.areaUnitLabel}
              currency={displayContext.currency}
            />
          ))}
        </div>

        <button
          onClick={actions.onAdd}
          className="w-full px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span>+</span>
          <span>Adicionar Item</span>
        </button>
      </div>
    </Accordion>
  );
}
