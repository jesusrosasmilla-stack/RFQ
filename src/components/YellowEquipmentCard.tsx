"use client";

import { useState, useTransition } from "react";
import { upsertYellowRecord, addYellowStop, deleteYellowStop } from "@/lib/actions/yellow";
import { calcularResumenLineaAmarilla } from "@/lib/metrics";
import { nowHHMM } from "@/lib/clock";
import { STOP_TYPE_LABELS, STOP_TYPE_EMOJI } from "@/lib/labels";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";

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

type StopStage = "idle" | "running" | "detailing";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [stopStage, setStopStage] = useState<StopStage>("idle");
  const [stopStart, setStopStart] = useState<string | null>(null);
  const [stopEnd, setStopEnd] = useState<string | null>(null);
  const [tipo, setTipo] = useState("FALLA_MECANICA");
  const [observacion, setObservacion] = useState("");

  const dictation = useVoiceDictation((text) =>
    setObservacion((prev) => (prev ? `${prev} ${text}` : text))
  );

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

  function handleStartStop() {
    if (!record) {
      setError("Primero guarda el horómetro inicial.");
      return;
    }
    setError(null);
    setStopStart(nowHHMM());
    setStopStage("running");
  }

  function handleEndStop() {
    setStopEnd(nowHHMM());
    setStopStage("detailing");
  }

  function resetStopFlow() {
    setStopStage("idle");
    setStopStart(null);
    setStopEnd(null);
    setTipo("FALLA_MECANICA");
    setObservacion("");
  }

  function handleSaveStop() {
    if (!record || !stopStart || !stopEnd) return;
    setError(null);
    startTransition(async () => {
      try {
        await addYellowStop({
          recordId: record.id,
          horaInicio: stopStart,
          horaFin: stopEnd,
          tipo: tipo as "FALLA_MECANICA",
          observacion,
        });
        resetStopFlow();
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
            className="w-full border border-slate-300 rounded-md px-2 py-2 text-base disabled:bg-slate-100"
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
            className="w-full border border-slate-300 rounded-md px-2 py-2 text-base disabled:bg-slate-100"
          />
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            disabled={!editable || pending}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm rounded-md py-2"
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
                {STOP_TYPE_EMOJI[s.tipo] ?? ""} {s.horaInicio}–{s.horaFin} ·{" "}
                {STOP_TYPE_LABELS[s.tipo] ?? s.tipo}
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

        {editable && stopStage === "idle" && (
          <button
            onClick={handleStartStop}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md py-3 flex items-center justify-center gap-2"
          >
            🛑 Reportar parada (toca al detenerse)
          </button>
        )}

        {editable && stopStage === "running" && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-2 space-y-2">
            <p className="text-xs text-amber-700">
              ⏱ Parada iniciada a las <strong>{stopStart}</strong>. Toca cuando el equipo vuelva a
              trabajar.
            </p>
            <button
              onClick={handleEndStop}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md py-3"
            >
              ▶ Equipo reanudó trabajo
            </button>
            <button
              onClick={resetStopFlow}
              className="w-full text-xs text-slate-500 underline py-1"
            >
              Cancelar
            </button>
          </div>
        )}

        {editable && stopStage === "detailing" && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 space-y-2">
            <p className="text-xs text-slate-600">
              Parada de <strong>{stopStart}</strong> a <strong>{stopEnd}</strong>. ¿Cuál fue el
              motivo?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(STOP_TYPE_LABELS).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTipo(k)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border ${
                    tipo === k
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {STOP_TYPE_EMOJI[k]} {label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <textarea
                placeholder="Observación (escribe o dicta con el micrófono)"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={2}
                className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={dictation.toggle}
                title="Dictar observación por voz"
                className={`shrink-0 w-10 rounded-md text-lg ${
                  dictation.listening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                🎤
              </button>
            </div>
            {dictation.unsupported && (
              <p className="text-[11px] text-amber-600">
                Tu navegador no soporta dictado por voz aquí; escribe la observación.
              </p>
            )}
            <div className="flex gap-1.5">
              <button
                onClick={handleSaveStop}
                disabled={pending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm rounded-md py-2"
              >
                Guardar parada
              </button>
              <button onClick={resetStopFlow} className="px-3 text-xs text-slate-500 underline">
                Cancelar
              </button>
            </div>
          </div>
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
