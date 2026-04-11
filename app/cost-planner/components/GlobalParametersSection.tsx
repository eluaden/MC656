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
                    <div className="relative">
                        <select
                            value={parameters.crop}
                            onChange={(e) => onUpdate({ crop: e.target.value as Crop })}
                            className="appearance-none w-full bg-transparent text-white font-medium border border-gray-700 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer transition-all hover:border-gray-600"
                        >
                            {CROPS.map((crop) => (
                                <option key={crop} value={crop} className="text-black">
                                    {crop}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Área</label>
                    <div className="relative">
                        <select
                            value={parameters.areaUnit}
                            onChange={(e) => onUpdate({ areaUnit: e.target.value as AreaUnit })}
                            className="appearance-none w-full bg-transparent text-white font-medium border border-gray-700 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer transition-all hover:border-gray-600"
                        >
                            {AREA_UNITS.map((unit) => (
                                <option key={unit.value} value={unit.value} className="text-black">
                                    {unit.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
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
