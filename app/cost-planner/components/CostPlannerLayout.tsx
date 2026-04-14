"use client";

import React, { useState } from "react";
import { useCostPlanner } from "../hooks/useCostPlanner";
import { GlobalParametersSection } from "./GlobalParametersSection";
import { SectionAccordion } from "./SectionAccordion";
import { CostPieChart } from "./CostPieChart";
import { AddItemModal } from "./AddItemModal";
import { formatCurrency } from "../utils/formatCurrency";
import { pdf } from "@react-pdf/renderer";
import { CostPlannerPDF } from "./CostPlannerPDF";
import Link from "next/link";

const SECTION_CONFIG = [
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
  const {
    state,
    totals,
    updateGlobalParameters,
    addItem,
    updateItem,
    deleteItem,
    getItemsBySection,
    saveProject,
    clearForm,
  } = useCostPlanner();

  const areaUnitLabel = state.globalParameters.areaUnit === "m²" ? "m²" : "Hectare";

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [addItemSection, setAddItemSection] = useState<"Preparo" | "Plantio" | "Manejo" | "Colheita">("Preparo");
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenAddModal = (sectionId: "Preparo" | "Plantio" | "Manejo" | "Colheita") => {
    setAddItemSection(sectionId);
    setAddItemModalOpen(true);
  };

  const handleAddItem = (itemData: any) => {
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

  const handleSaveProject = () => {
    saveProject();
    alert("Projeto salvo com sucesso!");
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
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
          >
            Voltar
          </Link>
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
                sectionId={section.id}
                sectionLabel={section.label}
                sectionDescription={section.description}
                items={getItemsBySection(section.id)}
                onAddItem={() => handleOpenAddModal(section.id)}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                area={state.globalParameters.area}
                areaUnitLabel={areaUnitLabel}
                sectionTotal={totals.sectionTotals[section.id]}
                currency={state.globalParameters.currency}
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
  totals: any;
  onClear: () => void;
  onExport: () => Promise<void>;
  isExporting: boolean;
  areaUnitLabel: string;
  currency: any;
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
            {Object.entries(totals.categoryTotals).map(([category, cost]: [string, any]) => (
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
          {isExporting ? "📄 Gerando PDF..." : "📄 Exportar PDF"}
        </button>
        <button
          onClick={onClear}
          className="w-full px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 rounded-lg transition font-medium text-sm"
        >
          🗑️ Limpar Formulário
        </button>
      </div>
    </div>
  );
}
