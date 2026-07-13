"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCostPlanner } from "../hooks/useCostPlanner";
import { GlobalParametersSection } from "./GlobalParametersSection";
import { SectionAccordion } from "./SectionAccordion";
import { CostPieChart } from "./CostPieChart";
import { AddItemModal } from "./AddItemModal";
import { formatCurrency } from "../utils/formatCurrency";
import { pdf } from "@react-pdf/renderer";
import { CostPlannerPDF } from "./CostPlannerPDF";
import { CostItem, CalculatedCosts, CurrencyConfig, CurrencyCode, GlobalParameters } from "../types";
import { useRouter } from "next/navigation";

// Currency presets used when pre-filling from the globe (via ?currency=).
const CURRENCY_PRESETS: Record<CurrencyCode, CurrencyConfig> = {
  BRL: { code: "BRL", symbol: "R$", locale: "pt-BR", decimalPlaces: 2 },
  USD: { code: "USD", symbol: "US$", locale: "en-US", decimalPlaces: 2 },
  EUR: { code: "EUR", symbol: "€", locale: "en-US", decimalPlaces: 2 },
};

const SECTION_CONFIG: SectionConfig[] = [
  {
    id: "Preparo" as const,
    label: "Preparação do Solo",
    description:
      "Calcário, gesso e outras correções de solo antes do plantio.",
  },
  {
    id: "Plantio" as const,
    label: "Plantio",
    description: "Sementes, herbicidas e insumos de plantio.",
  },
  {
    id: "Manejo" as const,
    label: "Manejo",
    description: "Fertilizantes, fungicidas e defensivos.",
  },
  {
    id: "Colheita" as const,
    label: "Colheita",
    description: "Máquinas, equipamentos e mão de obra de colheita.",
  },
];

export function CostPlannerLayout() {
  const router = useRouter();

  // Returns to wherever the user came from (globe or home menu); falls back to
  // the home menu if there's no in-app history (e.g. opened directly).
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const prefillApplied = useRef(false);
  const [originContext, setOriginContext] = useState<{
    region: string | null;
    soil: string | null;
    crop: string | null;
    match: string | null;
  } | null>(null);

  const {
    state,
    totals,
    updateGlobalParameters,
    addItem,
    updateItem,
    deleteItem,
    getItemsBySection,
    clearForm,
    isLoaded,
  } = useCostPlanner();

  const areaUnitLabel = state.globalParameters.areaUnit === "m²" ? "m²" : "Hectare";

  // Pre-fills crop and currency when arriving from the globe (?crop=&currency=),
  // keeps the procedence context for the badge, then strips the query so a
  // refresh won't overwrite the user's later edits.
  useEffect(() => {
    if (prefillApplied.current) return;
    prefillApplied.current = true;

    const params = new URLSearchParams(window.location.search);
    const crop = params.get("crop");
    const currencyCode = params.get("currency") as CurrencyCode | null;
    const region = params.get("region");
    const soil = params.get("soil");
    const match = params.get("match");

    const updates: Partial<GlobalParameters> = {};
    if (crop) updates.crop = crop;
    if (currencyCode && CURRENCY_PRESETS[currencyCode]) {
      updates.currency = CURRENCY_PRESETS[currencyCode];
    }

    if (region || soil || crop) {
      setOriginContext({ region, soil, crop, match });
    }

    if (Object.keys(updates).length > 0) {
      updateGlobalParameters(updates);
      router.replace("/cost-planner");
    }
  }, [updateGlobalParameters, router]);

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [addItemSection, setAddItemSection] = useState<"Preparo" | "Plantio" | "Manejo" | "Colheita">("Preparo");
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenAddModal = (sectionId: "Preparo" | "Plantio" | "Manejo" | "Colheita") => {
    setAddItemSection(sectionId);
    setAddItemModalOpen(true);
  };

  const handleAddItem = (itemData: Omit<CostItem, "id">) => {
    addItem(addItemSection, itemData);
  };

  const handleClearForm = () => {
    if (
      window.confirm(
        "Tem certeza que deseja limpar o formulário? Isso não pode ser desfeito."
      )
    ) {
      clearForm();
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const doc = <CostPlannerPDF state={state} totals={totals} />;
      const pdfBlob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-custos-${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-500 font-medium">Carregando planejador...</p>
        </div>
      </div>
    );
  }

  const displayContext = {
    area: state.globalParameters.area,
    areaUnitLabel,
    currency: state.globalParameters.currency,
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Planejador de Custos
            </h1>
            <p className="text-gray-300">AgroGlobe - Gestão de Custos Agrícolas</p>
            {originContext && (
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                <svg className="h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="truncate">
                  {[
                    originContext.region,
                    originContext.soil,
                    originContext.crop &&
                      `${originContext.crop}${originContext.match ? ` ${originContext.match}%` : ""}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
          >
            Voltar
          </button>
        </div>

        {/* Grid 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Formulário (2/3 em lg) */}
          <div className="lg:col-span-2 space-y-4">
            <GlobalParametersSection
              parameters={state.globalParameters}
              onUpdate={updateGlobalParameters}
            />

            {SECTION_CONFIG.map((section) => (
              <SectionAccordion
                key={section.id}
                section={section}
                items={getItemsBySection(section.id)}
                actions={{
                  onAdd: () => handleOpenAddModal(section.id),
                  onUpdate: updateItem,
                  onDelete: deleteItem,
                }}
                displayContext={displayContext}
                sectionTotal={totals.sectionTotals[section.id]}
              />
            ))}
          </div>

          {/* Coluna Direita - Resumo Fixo (1/3 em lg) */}
          <div className="lg:col-span-1 h-fit">
            <div className="space-y-4">
              <CostSummaryPanelWithExport
                totals={totals}
                onClear={handleClearForm}
                onExport={handleExportPDF}
                isExporting={isExporting}
                areaUnitLabel={areaUnitLabel}
                currency={state.globalParameters.currency}
              />

              {/* Gráfico de Pizza */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Custos por Categoria
                </h3>
                <CostPieChart totals={totals} currency={state.globalParameters.currency} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Item */}
      <AddItemModal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onAdd={handleAddItem}
        sectionId={addItemSection}
        areaUnitLabel={areaUnitLabel}
        currency={state.globalParameters.currency}
      />
    </div>
  );
}

interface CostSummaryPanelWithExportProps {
  totals: CalculatedCosts;
  onClear: () => void;
  onExport: () => Promise<void>;
  isExporting: boolean;
  areaUnitLabel: string;
  currency: CurrencyConfig;
}

function CostSummaryPanelWithExport({
  totals,
  onClear,
  onExport,
  isExporting,
  areaUnitLabel,
  currency,
}: CostSummaryPanelWithExportProps) {
  
  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Custo Total */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-xs text-emerald-300 mb-2">CUSTO TOTAL ESTIMADO</p>
          <p className="text-3xl font-bold text-emerald-300">
            {formatCurrency(totals.totalCost, currency)}
          </p>
        </div>

        {/* Custo por Hectare */}
        <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-xs text-blue-300 mb-2">CUSTO POR {areaUnitLabel.toUpperCase()}</p>
          <p className="text-2xl font-bold text-blue-300">
            {formatCurrency(totals.costPerAreaUnit, currency)}
          </p>
        </div>

        {/* Totais por Categoria */}
        <div>
          <p className="text-xs text-gray-400 mb-3 font-semibold">
            CUSTOS POR CATEGORIA
          </p>
          <div className="space-y-2">
            {Object.entries(totals.categoryTotals).map(([category, cost]: [string, number]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{category}</span>
                <span className="font-semibold text-white">
                  {formatCurrency(cost, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé com botões */}
      <div className="border-t border-gray-800 p-4 space-y-2 bg-gray-900">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 rounded-lg transition font-medium text-sm disabled:opacity-50"
        >
          {isExporting ? "📄 Gerando PDF..." : "Exportar PDF"}
        </button>
        <button
          onClick={onClear}
          className="w-full px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 rounded-lg transition font-medium text-sm"
        >
          Limpar Formulário
        </button>
      </div>
    </div>
  );
}
