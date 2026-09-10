"use client";

import { useState, useTransition } from "react";
import { upsertYellowRecord, addYellowStop, deleteYellowStop } from "@/lib/actions/yellow";
import { calcularResumenLineaAmarilla } from "@/lib/metrics";

type Stop = {
  id: string;
  horaInicio: string;
  horaFin: string;
  tipo: string;
  observacion: string | null;
};

type Record_ = {
  id: string;
  horometroInicial: number;
  horometroFinal: number | null;
  locked: boolean;
  stops: Stop[];
} | null;

const TIPO_LABELS: Record<string, string> = {
  FALLA_MECANICA: "Falla mecánica",
  MANTENIMIENTO: "Mantenimiento",
  CLIMA: "Clima",
  FALTA_OPERADOR: "Falta de operador",
  FALTA_MATERIAL: "Falta de material",
  OTRO: "Otro",
};

export function YellowEquipmentCard({
  equipment,
  date,
  record,
  editable,
  settings,
}: {
  equipment: { id: string; code: string; name: string; model: string | null };
  date: string;
  record: Record_;
  editable: boolean;
  settings: { workStart: string; workEnd: string; lunchStart: string; lunchEnd: string };
}) {
  const [horometroInicial, setHorometroInicial] = useState(
    record?.horometroInicial?.toString() ?? ""
  );
  const [horometroFinal, setHorometroFinal] = useState(record?.horometroFinal?.toString() ?? "");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [tipo, setTipo] = useState("FALLA_MECANICA");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resumen = calcularResumenLineaAmarilla(
    Number(horometroInicial) || 0,
    horometroFinal === "" ? null : Number(horometroFinal),
    record?.stops ?? [],
    settings
  );

  function handleSaveHorometro(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await upsertYellowRecord({
          equipmentId: equipment.id,
          date,
          horometroInicial: Number(horometroInicial),
          horometroFinal: horometroFinal === "" ? null : Number(horometroFinal),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  function handleAddStop(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!record) {
      setError("Primero guarda el horómetro inicial.");
      return;
    }
    startTransition(async () => {
      try {
        await addYellowStop({
          recordId: record.id,
          horaInicio,
          horaFin,
          tipo: tipo as "FALLA_MECANICA",
          observacion,
        });
        setHoraInicio("");
        setHoraFin("");
        setObservacion("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar parada.");
      }
    });
  }

  function handleDeleteStop(stopId: string) {
    startTransition(async () => {
      try {
        await deleteYellowStop(stopId);
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

      <form onSubmit={handleSaveHorometro} className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-500 mb-0.5">Horómetro inicial</label>
          <input
            type="number"
            step="0.1"
            required
            disabled={!editable}
            value={horometroInicial}
            onChange={(e) => setHorometroInicial(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-0.5">Horómetro final</label>
          <input
            type="number"
            step="0.1"
            disabled={!editable}
            value={horometroFinal}
            onChange={(e) => setHorometroFinal(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm disabled:bg-slate-100"
          />
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            disabled={!editable || pending}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm rounded-md py-1.5"
          >
            Guardar horómetro
          </button>
        </div>
      </form>

      <div className="border-t border-slate-100 pt-2">
        <p className="text-xs font-medium text-slate-600 mb-1">Paradas / fallas mecánicas</p>
        <ul className="space-y-1 mb-2">
          {(record?.stops ?? []).map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1"
            >
              <span>
                {s.horaInicio}–{s.horaFin} · {TIPO_LABELS[s.tipo] ?? s.tipo}
                {s.observacion ? ` · ${s.observacion}` : ""}
              </span>
              {editable && (
                <button
                  onClick={() => handleDeleteStop(s.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
          {(record?.stops ?? []).length === 0 && (
            <li className="text-xs text-slate-400">Sin paradas registradas.</li>
          )}
        </ul>

        {editable && (
          <form onSubmit={handleAddStop} className="grid grid-cols-2 gap-1.5">
            <input
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1 text-xs"
            />
            <input
              type="time"
              required
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1 text-xs"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="col-span-2 border border-slate-300 rounded-md px-2 py-1 text-xs"
            >
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
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
              + Agregar parada
            </button>
          </form>
        )}
      </div>

      <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded px-2 py-1.5">
          <p className="text-slate-500">HM horómetro</p>
          <p className="font-semibold text-slate-800">{resumen.hmHorometro ?? "—"} h</p>
        </div>
        <div className="bg-slate-50 rounded px-2 py-1.5">
          <p className="text-slate-500">Horas disponibles</p>
          <p className="font-semibold text-slate-800">{resumen.horasDisponibles} h</p>
        </div>
        <div className="bg-slate-50 rounded px-2 py-1.5">
          <p className="text-slate-500">Paradas</p>
          <p className="font-semibold text-slate-800">{resumen.paradasHoras} h</p>
        </div>
        <div
          className={`rounded px-2 py-1.5 ${
            resumen.eficiencia == null
              ? "bg-slate-50"
              : resumen.eficiencia >= 85
              ? "bg-emerald-50"
              : resumen.eficiencia >= 65
              ? "bg-amber-50"
              : "bg-red-50"
          }`}
        >
          <p className="text-slate-500">Eficiencia</p>
          <p className="font-semibold text-slate-800">
            {resumen.eficiencia != null ? `${resumen.eficiencia}%` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
