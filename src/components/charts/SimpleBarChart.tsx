"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SEQUENTIAL_BLUE } from "@/lib/colors";

export function SimpleBarChart({
  data,
  unit,
}: {
  data: { label: string; value: number }[];
  unit: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">Sin datos para esta fecha.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#e1e0d9" />
        <XAxis type="number" stroke="#898781" fontSize={12} unit={unit} />
        <YAxis type="category" dataKey="label" stroke="#898781" fontSize={12} width={90} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e1e0d9" }}
          formatter={(value) => [`${value}${unit}`, ""]}
        />
        <Bar dataKey="value" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
