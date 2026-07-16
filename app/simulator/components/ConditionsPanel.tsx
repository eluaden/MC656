"use client";

import { FieldConditions } from "../types";

type ConditionsPanelProps = {
  conditions: FieldConditions;
  isFetchingMap: boolean;
  onAdjust: (
    changes: Partial<Pick<FieldConditions, "temperature" | "ph">>,
  ) => void;
};

/**
 * Condições do terreno que alimentam a simulação de crescimento
 * (temperatura média do ar e pH do solo). Vêm pré-preenchidas com dados
 * reais quando o simulador é aberto a partir de um ponto do globo.
 */
export function ConditionsPanel({
  conditions,
  isFetchingMap,
  onAdjust,
}: ConditionsPanelProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-sky-400">
          Condições do terreno
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            conditions.source === "mapa"
              ? "bg-sky-500/15 text-sky-300"
              : "bg-gray-500/15 text-gray-400"
          }`}
        >
          {conditions.source === "mapa" ? "Dados do mapa" : "Manual"}
        </span>
      </div>

      {isFetchingMap && (
        <p className="px-1 pb-2 text-xs text-gray-400 animate-pulse">
          Buscando clima e solo do ponto selecionado...
        </p>
      )}
      {conditions.source === "mapa" && conditions.regionLabel && (
        <p className="px-1 pb-2 text-xs text-gray-400">
          📍 {conditions.regionLabel}
        </p>
      )}

      <ConditionSlider
        label="Temperatura média"
        unit="°C"
        min={-5}
        max={45}
        step={0.5}
        value={conditions.temperature}
        onChange={(temperature) => onAdjust({ temperature })}
      />
      <ConditionSlider
        label="pH do solo"
        unit=""
        min={3.5}
        max={9.5}
        step={0.1}
        value={conditions.ph}
        onChange={(ph) => onAdjust({ ph })}
      />

      <p className="px-1 pt-2 text-[10px] leading-relaxed text-gray-600">
        A velocidade de crescimento de cada cultura segue os limiares da FAO
        Ecocrop para estas condições.
      </p>
    </div>
  );
}

type ConditionSliderProps = {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function ConditionSlider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: ConditionSliderProps) {
  return (
    <label className="block px-1 py-1.5">
      <span className="flex items-baseline justify-between text-sm text-gray-300">
        {label}
        <span className="font-mono text-xs text-white">
          {value.toFixed(1)}
          {unit && ` ${unit}`}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-emerald-500"
      />
    </label>
  );
}
