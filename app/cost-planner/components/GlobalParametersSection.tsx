"use client";

import React from "react";
import { Crop, AreaUnit, GlobalParameters } from "../types";
import { Accordion } from "./Accordion";
import { NumericInput } from "./NumericInput";

interface GlobalParametersSectionProps {
    parameters: GlobalParameters;
    onUpdate: (updates: Partial<GlobalParameters>) => void;
}

const CROPS: Crop[] = ["Soja", "Café", "Cana de açúcar"];
const AREA_UNITS: { value: AreaUnit; label: string; abbr: string }[] = [
    { value: "hectares", label: "Hectares", abbr: "ha" },
    { value: "m²", label: "Metros quadrados (m²)", abbr: "m²" },
];

export function GlobalParametersSection({
    parameters,
    onUpdate,
}: GlobalParametersSectionProps) {
    const handleAreaChange = (value: number) => {
        if (value >= 0) {
            onUpdate({ area: value });
        }
    };

    const currentUnit = AREA_UNITS.find((u) => u.value === parameters.areaUnit) ?? AREA_UNITS[0];

    return (
        <Accordion
            id="global"
            title="Parâmetros Globais"
            description="Cultura e área de plantio"
            isDefaultOpen={true}
        >
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Cultura</label>
                    <select
                        value={parameters.crop}
                        onChange={(e) => onUpdate({ crop: e.target.value as Crop })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                        {CROPS.map((crop) => (
                            <option key={crop} value={crop} className="text-black">
                                {crop}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Unidade de Área</label>
                    <select
                        value={parameters.areaUnit}
                        onChange={(e) => onUpdate({ areaUnit: e.target.value as AreaUnit })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                        {AREA_UNITS.map((unit) => (
                            <option key={unit.value} value={unit.value} className="text-black">
                                {unit.label}
                            </option>
                        ))}
                    </select>
                </div>

                <NumericInput
                    label="Área de Plantio"
                    value={parameters.area}
                    onChange={handleAreaChange}
                    suffix={` ${currentUnit.label}`}
                    min={0}
                    step={parameters.areaUnit === "m²" ? 1 : 0.01}
                    required
                />

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-xs text-gray-400">Cultura: {parameters.crop}</p>
                    <p className="text-sm font-semibold text-emerald-300 mt-1">
                        {parameters.area} {currentUnit.abbr}
                    </p>
                </div>
            </div>
        </Accordion>
    );
}
