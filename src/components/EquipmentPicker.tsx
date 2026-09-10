"use client";

import { useMemo, useState, useTransition } from "react";
import { addToRoster } from "@/lib/actions/roster";

type Item = { id: string; code: string; name: string; placa: string | null };

export function EquipmentPicker({ date, available }: { date: string; available: Item[] }) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (eq) =>
        eq.code.toLowerCase().includes(q) ||
        eq.name.toLowerCase().includes(q) ||
        eq.placa?.toLowerCase().includes(q)
    );
  }, [available, query]);

  function handleAdd(equipmentId: string, estado: "TRABAJANDO" | "INOPERATIVO") {
    setError(null);
    let motivo: string | undefined;
    if (estado === "INOPERATIVO") {
      motivo = window.prompt("¿Motivo por el que está inoperativo?") || undefined;
    }
    startTransition(async () => {
      try {
        await addToRoster({ equipmentId, date, estado, motivo });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al agregar el equipo.");
      }
    });
  }

  if (available.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h2 className="font-semibold text-slate-800 mb-1">+ Agregar equipo al día</h2>
      <p className="text-xs text-slate-500 mb-2">
        Selecciona los equipos que van a trabajar hoy. Puedes seguir agregando equipos que se
        incorporen durante la jornada.
      </p>
      <input
        type="text"
        placeholder="Buscar por código, nombre o placa..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-2"
      />
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {filtered.map((eq) => (
          <li key={eq.id} className="flex items-center justify-between py-1.5 text-sm">
            <span>
              <span className="font-medium">{eq.code}</span>{" "}
              <span className="text-slate-500">
                {eq.name}
                {eq.placa ? ` · ${eq.placa}` : ""}
              </span>
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                disabled={pending}
                onClick={() => handleAdd(eq.id, "TRABAJANDO")}
                className="text-xs px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                + Agregar
              </button>
              <button
                disabled={pending}
                onClick={() => handleAdd(eq.id, "INOPERATIVO")}
                className="text-xs px-2 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
              >
                🔧 Inoperativo
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="py-2 text-sm text-slate-400">Sin resultados.</li>}
      </ul>
    </div>
  );
}
