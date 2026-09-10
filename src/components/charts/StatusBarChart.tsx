"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STATUS, statusForCumplimiento, statusForEficiencia } from "@/lib/colors";

export function StatusBarChart({
  data,
  unit,
  mode,
}: {
  data: { label: string; value: number }[];
  unit: string;
  mode: "eficiencia" | "cumplimiento";
}) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">Sin datos para esta fecha.</p>;
  }
  const statusFor = mode === "eficiencia" ? statusForEficiencia : statusForCumplimiento;
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
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={STATUS[statusFor(d.value)]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
