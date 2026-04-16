"use client";

import React from "react";
import { AreaUnit, GlobalParameters, CurrencyCode } from "../types";
import { Accordion } from "./Accordion";
import { NumericInput } from "./NumericInput";

interface GlobalParametersSectionProps {
    parameters: GlobalParameters;
    onUpdate: (updates: Partial<GlobalParameters>) => void;
}

const AREA_UNITS: { value: AreaUnit; label: string; abbr: string }[] = [
    { value: "hectares", label: "Hectares", abbr: "ha" },
    { value: "m²", label: "Metros quadrados (m²)", abbr: "m²" },
];

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string; symbol: string }[] = [
    { value: "BRL", label: "Real Brasileiro", symbol: "R$" },
    { value: "USD", label: "Dólar Americano", symbol: "US$" },
    { value: "EUR", label: "Euro", symbol: "€" },
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
    
    // Garantir que currency tem um valor padrão
    const currentCurrency = parameters.currency || {
        code: "BRL" as const,
        symbol: "R$",
        locale: "pt-BR",
        decimalPlaces: 2,
    };

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
                    <input
                        type="text"
                        value={parameters.crop}
                        onChange={(e) => onUpdate({ crop: e.target.value })}
                        placeholder="Ex: Soja, Café, Cana de açúcar..."
                        className="w-full bg-transparent text-white font-medium border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all hover:border-gray-600"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Unidade de Área</label>
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

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-200">Moeda</label>
                    <div className="relative">
                        <select
                            value={currentCurrency.code}
                            onChange={(e) => {
                                const currencyCode = e.target.value as CurrencyCode;
                                const currencyOption = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
                                if (currencyOption) {
                                    onUpdate({
                                        currency: {
                                            code: currencyCode,
                                            symbol: currencyOption.symbol,
                                            locale: currencyCode === "BRL" ? "pt-BR" : "en-US",
                                            decimalPlaces: 2,
                                        },
                                    });
                                }
                            }}
                            className="appearance-none w-full bg-transparent text-white font-medium border border-gray-700 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer transition-all hover:border-gray-600"
                        >
                            {CURRENCY_OPTIONS.map((currency) => (
                                <option key={currency.value} value={currency.value} className="text-black">
                                    {currency.label} ({currency.symbol})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-xs text-gray-400">Cultura: {parameters.crop}</p>
                    <p className="text-sm font-semibold text-emerald-300 mt-1">
                        {parameters.area} {currentUnit.abbr}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Moeda: {currentCurrency.symbol} ({currentCurrency.code})</p>
                </div>
            </div>
        </Accordion>
    );
}
