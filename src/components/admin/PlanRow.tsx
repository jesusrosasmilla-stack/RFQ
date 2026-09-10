"use client";

import { useState, useTransition } from "react";
import { upsertDailyPlan, setCausaNoCumplimiento } from "@/lib/actions/plans";

const CAUSAS = [
  "Falla mecánica",
  "Clima",
  "Falta de operador",
  "Falta de material / frente no disponible",
  "Falta de combustible",
  "Reprogramación de trabajo",
  "Otro",
];

export function PlanRow({
  equipmentId,
  equipmentLabel,
  metrica,
  date,
  planned,
  planId,
  actual,
  cumplimiento,
  causa,
}: {
  equipmentId: string;
  equipmentLabel: string;
  metrica: "HM" | "VIAJES";
  date: string;
  planned: number | null;
  planId: string | null;
  actual: number;
  cumplimiento: number | null;
  causa: string | null;
}) {
  const [value, setValue] = useState(planned?.toString() ?? "");
  const [pending, startTransition] = useTransition();

  function handleSavePlan() {
    if (!value) return;
    startTransition(async () => {
      await upsertDailyPlan({ equipmentId, date, metrica, valorPlanificado: Number(value) });
    });
  }

  function handleCausa(c: string) {
    if (!planId) return;
    startTransition(async () => {
      await setCausaNoCumplimiento(planId, c);
    });
  }

  const badgeColor =
    cumplimiento == null
      ? "bg-slate-100 text-slate-500"
      : cumplimiento >= 100
      ? "bg-emerald-100 text-emerald-700"
      : cumplimiento >= 80
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <tr className="border-b border-slate-50">
      <td className="py-2 pr-2">{equipmentLabel}</td>
      <td className="py-2 pr-2 text-slate-500">{metrica === "HM" ? "Horas máquina" : "Viajes"}</td>
      <td className="py-2 pr-2">
        <div className="flex gap-1">
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-20 border border-slate-300 rounded-md px-2 py-1 text-xs"
          />
          <button
            disabled={pending}
            onClick={handleSavePlan}
            className="text-xs px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </td>
      <td className="py-2 pr-2 font-medium">{actual}</td>
      <td className="py-2 pr-2">
        <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
          {cumplimiento != null ? `${cumplimiento}%` : "—"}
        </span>
      </td>
      <td className="py-2 pr-2">
        {planId && cumplimiento != null && cumplimiento < 100 ? (
          <select
            value={causa ?? ""}
            onChange={(e) => handleCausa(e.target.value)}
            className="border border-slate-300 rounded-md px-2 py-1 text-xs"
          >
            <option value="">Seleccionar causa…</option>
            {CAUSAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-slate-400">{causa ?? "—"}</span>
        )}
      </td>
    </tr>
  );
}
