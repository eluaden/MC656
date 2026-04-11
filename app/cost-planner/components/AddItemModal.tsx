"use client";

import React, { useState } from "react";
import { SectionType, CostCategory } from "../types";
import { NumericInput } from "./NumericInput";

interface AddItemModalProps {
    isOpen: boolean;
    sectionId: SectionType;
    onAdd: (item: {
        section: SectionType;
        name: string;
        costCategory: CostCategory;
        pricePerUnit: number;
        quantityPerHectare: number;
        unit: string;
    }) => void;
    onClose: () => void;
}

const UNIT_OPTIONS = ["kg", "L", "pessoa-dia", "hora"];
const CATEGORY_OPTIONS: CostCategory[] = ["Insumos", "Mecanização", "Mão de Obra"];

export function AddItemModal({
    isOpen,
    sectionId,
    onAdd,
    onClose,
}: AddItemModalProps) {
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState<CostCategory>("Insumos");
    const [unit, setUnit] = useState("kg");
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [quantityPerHectare, setQuantityPerHectare] = useState(0);

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
            quantityPerHectare,
            unit,
        });

        // Reset form
        setItemName("");
        setCategory("Insumos");
        setUnit("kg");
        setPricePerUnit(0);
        setQuantityPerHectare(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-96 space-y-4">
                <h2 className="text-xl font-bold text-white">Adicionar Item</h2>

                {/* Nome do Item */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Nome do Item</label>
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Ex: Adubo, Pesticida, Máquina..."
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Categoria</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CostCategory)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Unidade */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Unidade</label>

                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                        {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u} className="text-black bg-white">
                                {u}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Preço */}
                <NumericInput
                    label="Preço Unitário"
                    value={pricePerUnit}
                    onChange={setPricePerUnit}
                    suffix="R$"
                    min={0}
                    step={0.01}
                />

                {/* Quantidade */}
                <NumericInput
                    label={`Quantidade por Hectare (${unit})`}
                    value={quantityPerHectare}
                    onChange={setQuantityPerHectare}
                    min={0}
                    step={unit === "kg" ? 1 : 0.01}
                />

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-lg transition"
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
