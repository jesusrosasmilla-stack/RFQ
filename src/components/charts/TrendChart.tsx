"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CATEGORICAL } from "@/lib/colors";

export function TrendChart({
  data,
}: {
  data: { date: string; eficiencia: number | null; ppc: number | null }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#e1e0d9" vertical={false} />
        <XAxis dataKey="date" stroke="#898781" fontSize={11} />
        <YAxis stroke="#898781" fontSize={12} unit="%" domain={[0, 100]} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e1e0d9" }}
          formatter={(value) => [`${value}%`, ""]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="eficiencia"
          name="Eficiencia línea amarilla"
          stroke={CATEGORICAL[0]}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="ppc"
          name="PPC (Last Planner)"
          stroke={CATEGORICAL[1]}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
