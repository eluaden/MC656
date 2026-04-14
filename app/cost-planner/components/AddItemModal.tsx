"use client";

import React, { useState } from "react";
import { SectionType, CostCategory, CurrencyConfig } from "../types";
import { NumericInput } from "./NumericInput";

interface AddItemModalProps {
    isOpen: boolean;
    sectionId: SectionType;
    areaUnitLabel: string;
    onAdd: (item: {
        section: SectionType;
        name: string;
        costCategory: CostCategory;
        pricePerUnit: number;
        quantityPerAreaUnit: number;
        unit: string;
    }) => void;
    onClose: () => void;
    currency: CurrencyConfig;
}

const UNIT_OPTIONS = ["kg", "L", "pessoa-dia", "hora"];
const CATEGORY_OPTIONS: CostCategory[] = ["Insumos", "Mecanização", "Mão de Obra"];
const SECTION_LABELS: Record<SectionType, string> = {
    Preparo: "Preparação do Solo",
    Plantio: "Plantio",
    Manejo: "Manejo",
    Colheita: "Colheita",
};

export function AddItemModal({
    isOpen,
    sectionId,
    areaUnitLabel,
    onAdd,
    onClose,
    currency,
}: AddItemModalProps) {
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState<CostCategory>("Insumos");
    const [unit, setUnit] = useState("kg");
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [quantityPerAreaUnit, setQuantityPerAreaUnit] = useState(0);

    const handleAdd = () => {
        if (!itemName.trim()) {
            alert("Digite um nome para o item");
            return;
        }

        onAdd({
            section: sectionId,
            name: itemName,
            costCategory: category,
            pricePerUnit,
            quantityPerAreaUnit,
            unit,
        });

        setItemName("");
        setCategory("Insumos");
        setUnit("kg");
        setPricePerUnit(0);
        setQuantityPerAreaUnit(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-96 space-y-4">
                <h2 className="text-xl font-bold text-white">Adicionar Item</h2>
                <p className="text-sm text-emerald-300">Seção: {SECTION_LABELS[sectionId]}</p>

                {/* Nome do Item */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Nome do Item</label>
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Ex: Adubo, Pesticida, Máquina..."
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Categoria</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CostCategory)}
                            className="appearance-none w-full bg-transparent text-white font-medium border border-gray-700 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer transition-all hover:border-gray-600"
                        >
                            {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat} className="text-black bg-white">
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Unidade */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Unidade</label>

                    <div className="relative">
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="appearance-none w-full bg-transparent text-white font-medium border border-gray-700 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer transition-all hover:border-gray-600"
                        >
                            {UNIT_OPTIONS.map((u) => (
                                <option key={u} value={u} className="text-black bg-white">
                                    {u}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Preço */}
                <NumericInput
                    label="Preço Unitário"
                    value={pricePerUnit}
                    onChange={setPricePerUnit}
                    suffix={currency.symbol}
                    min={0}
                    step={0.01}
                />

                {/* Quantidade */}
                <NumericInput
                    label={`Quantidade por ${areaUnitLabel} (${unit})`}
                    value={quantityPerAreaUnit}
                    onChange={setQuantityPerAreaUnit}
                    min={0}
                    step={unit === "kg" ? 1 : 0.01}
                />

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 rounded-lg transition"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}
