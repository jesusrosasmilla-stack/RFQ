"use client";

import { useState, useTransition } from "react";
import { addTripForEquipment, deleteTrip } from "@/lib/actions/white";
import { calcularCicloViaje, promedioRobusto } from "@/lib/metrics";
import { nowHHMM } from "@/lib/clock";

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

type Stage = 0 | 1 | 2 | 3;

const STAGE_INFO: {
  stage: Stage;
  label: string;
  color: string;
  icon: string;
}[] = [
  { stage: 0, label: "Iniciar carguío", color: "bg-blue-600 hover:bg-blue-700", icon: "⛏️" },
  { stage: 1, label: "Fin de carguío (sale cargado)", color: "bg-orange-500 hover:bg-orange-600", icon: "🚛" },
  { stage: 2, label: "Llegó a botadero (inicia descarga)", color: "bg-violet-600 hover:bg-violet-700", icon: "📍" },
  { stage: 3, label: "Fin de descarga (viaje completo)", color: "bg-emerald-600 hover:bg-emerald-700", icon: "🏁" },
];

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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [stage, setStage] = useState<Stage>(0);
  const [carguioInicio, setCarguioInicio] = useState<string | null>(null);
  const [carguioFin, setCarguioFin] = useState<string | null>(null);
  const [descargaInicio, setDescargaInicio] = useState<string | null>(null);

  const trips = record?.trips ?? [];
  const computed = trips.map((t) => calcularCicloViaje(t, t.numero));
  const stats = promedioRobusto(computed.map((c) => c.cicloTotalMin));

  function resetFlow() {
    setStage(0);
    setCarguioInicio(null);
    setCarguioFin(null);
    setDescargaInicio(null);
  }

  function handleTap() {
    setError(null);
    const t = nowHHMM();
    if (stage === 0) {
      setCarguioInicio(t);
      setStage(1);
    } else if (stage === 1) {
      setCarguioFin(t);
      setStage(2);
    } else if (stage === 2) {
      setDescargaInicio(t);
      setStage(3);
    } else if (stage === 3) {
      if (!carguioInicio || !carguioFin || !descargaInicio) return;
      const descargaFin = t;
      startTransition(async () => {
        try {
          await addTripForEquipment({
            equipmentId: equipment.id,
            date,
            carguioInicio,
            carguioFin,
            descargaInicio,
            descargaFin,
          });
          resetFlow();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al guardar viaje.");
        }
      });
    }
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

  const current = STAGE_INFO[stage];

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

      {editable && (
        <div className="space-y-1.5">
          {stage > 0 && (
            <p className="text-xs text-slate-500">
              {carguioInicio && <>Carguío {carguioInicio}</>}
              {carguioFin && <> → {carguioFin}</>}
              {descargaInicio && <> · Descarga desde {descargaInicio}</>}
            </p>
          )}
          <button
            onClick={handleTap}
            disabled={pending}
            className={`w-full text-white text-sm font-medium rounded-md py-4 flex items-center justify-center gap-2 disabled:opacity-50 ${current.color}`}
          >
            <span className="text-xl">{current.icon}</span> {current.label}
          </button>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STAGE_INFO.map((s) => (
                <span
                  key={s.stage}
                  className={`h-1.5 w-6 rounded-full ${
                    s.stage <= stage ? "bg-slate-700" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            {stage > 0 && (
              <button onClick={resetFlow} className="text-xs text-slate-500 underline">
                Cancelar viaje
              </button>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2">
        <p className="text-xs font-medium text-slate-600 mb-1">Viajes registrados</p>
        <ul className="space-y-1 max-h-40 overflow-y-auto">
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
