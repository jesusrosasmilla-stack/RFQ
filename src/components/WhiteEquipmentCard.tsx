"use client";

import { useState, useTransition } from "react";
import { addTripForEquipment, deleteTrip } from "@/lib/actions/white";
import { calcularCicloViaje, promedioRobusto } from "@/lib/metrics";

type Trip = {
  id: string;
  numero: number;
  carguioInicio: string;
  carguioFin: string;
  descargaInicio: string;
  descargaFin: string;
  retornoFin: string | null;
  observacion: string | null;
};

type Record_ = {
  id: string;
  locked: boolean;
  trips: Trip[];
} | null;

export function WhiteEquipmentCard({
  equipment,
  date,
  record,
  editable,
}: {
  equipment: { id: string; code: string; name: string; model: string | null };
  date: string;
  record: Record_;
  editable: boolean;
}) {
  const [carguioInicio, setCarguioInicio] = useState("");
  const [carguioFin, setCarguioFin] = useState("");
  const [descargaInicio, setDescargaInicio] = useState("");
  const [descargaFin, setDescargaFin] = useState("");
  const [retornoFin, setRetornoFin] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trips = record?.trips ?? [];
  const computed = trips.map((t) => calcularCicloViaje(t, t.numero));
  const stats = promedioRobusto(computed.map((c) => c.cicloTotalMin));

  function handleAddTrip(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addTripForEquipment({
          equipmentId: equipment.id,
          date,
          carguioInicio,
          carguioFin,
          descargaInicio,
          descargaFin,
          retornoFin: retornoFin || null,
          observacion,
        });
        setCarguioInicio("");
        setCarguioFin("");
        setDescargaInicio("");
        setDescargaFin("");
        setRetornoFin("");
        setObservacion("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar viaje.");
      }
    });
  }

  function handleDeleteTrip(tripId: string) {
    startTransition(async () => {
      try {
        await deleteTrip(tripId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar.");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">
            {equipment.code} · {equipment.name}
          </h3>
          {equipment.model && <p className="text-xs text-slate-500">{equipment.model}</p>}
        </div>
        {record?.locked && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            Bloqueado
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{error}</p>}

      <div className="border-t border-slate-100 pt-2">
        <p className="text-xs font-medium text-slate-600 mb-1">Viajes registrados</p>
        <ul className="space-y-1 mb-2 max-h-40 overflow-y-auto">
          {computed.map((c, i) => (
            <li
              key={trips[i].id}
              className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1"
            >
              <span>
                #{c.numero} · Carguío {trips[i].carguioInicio}-{trips[i].carguioFin} · Descarga{" "}
                {trips[i].descargaInicio}-{trips[i].descargaFin} · Ciclo{" "}
                <strong>{c.cicloTotalMin} min</strong>
              </span>
              {editable && (
                <button
                  onClick={() => handleDeleteTrip(trips[i].id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
          {trips.length === 0 && <li className="text-xs text-slate-400">Sin viajes registrados.</li>}
        </ul>

        {editable && (
          <form onSubmit={handleAddTrip} className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] text-slate-500">Carguío inicio</label>
              <input
                type="time"
                required
                value={carguioInicio}
                onChange={(e) => setCarguioInicio(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Carguío fin</label>
              <input
                type="time"
                required
                value={carguioFin}
                onChange={(e) => setCarguioFin(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Descarga inicio</label>
              <input
                type="time"
                required
                value={descargaInicio}
                onChange={(e) => setDescargaInicio(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">Descarga fin</label>
              <input
                type="time"
                required
                value={descargaFin}
                onChange={(e) => setDescargaFin(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-slate-500">
                Retorno / llegada a carguío (opcional)
              </label>
              <input
                type="time"
                value={retornoFin}
                onChange={(e) => setRetornoFin(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
              />
            </div>
            <input
              type="text"
              placeholder="Observación (opcional)"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="col-span-2 border border-slate-300 rounded-md px-2 py-1 text-xs"
            />
            <button
              type="submit"
              disabled={pending}
              className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-md py-1.5"
            >
              + Agregar viaje
            </button>
          </form>
        )}
      </div>

      <div className="border-t border-slate-100 pt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-50 rounded px-2 py-1.5">
          <p className="text-slate-500">Viajes</p>
          <p className="font-semibold text-slate-800">{stats.n}</p>
        </div>
        <div className="bg-slate-50 rounded px-2 py-1.5">
          <p className="text-slate-500">Ciclo promedio</p>
          <p className="font-semibold text-slate-800">
            {stats.promedio != null ? `${stats.promedio} min` : "—"}
          </p>
        </div>
        <div className="bg-slate-50 rounded px-2 py-1.5">
          <p className="text-slate-500">Atípicos descartados</p>
          <p className="font-semibold text-slate-800">{stats.descartados}</p>
        </div>
      </div>
    </div>
  );
}
