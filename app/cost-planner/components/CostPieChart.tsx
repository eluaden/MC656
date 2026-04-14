"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalculatedCosts, CurrencyConfig } from "../types";
import { formatCurrency } from "../utils/formatCurrency";

interface CostPieChartProps {
  totals: CalculatedCosts;
  currency: CurrencyConfig;
}

const COLORS = {
  Insumos: "#10b981",
  Mecanização: "#3b82f6",
  "Mão de Obra": "#f59e0b",
};

export function CostPieChart({ totals, currency }: CostPieChartProps) {
  const data = Object.entries(totals.categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 border border-white/20 rounded p-2">
          <p className="text-white text-xs font-semibold">{payload[0].name}</p>
          <p className="text-emerald-300 text-xs">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">Nenhum custo registrado</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name as keyof typeof COLORS] || "#888"}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: "30px" }} 
          verticalAlign="bottom" 
          height={36}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
