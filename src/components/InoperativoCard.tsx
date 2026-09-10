"use client";

import { useState, useTransition } from "react";
import { setRosterEstado, uploadRosterFoto } from "@/lib/actions/roster";
import { PhotoUploadButton } from "@/components/PhotoUploadButton";

export function InoperativoCard({
  equipment,
  roster,
  editable,
}: {
  equipment: { code: string; name: string; model: string | null; placa: string | null };
  roster: { id: string; motivo: string | null; fotoInicioUrl: string | null; fotoFinUrl: string | null };
  editable: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleResume() {
    setError(null);
    startTransition(async () => {
      try {
        await setRosterEstado(roster.id, "TRABAJANDO");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al actualizar.");
      }
    });
  }

  return (
    <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">
            {equipment.code} · {equipment.name}
          </h3>
          {(equipment.model || equipment.placa) && (
            <p className="text-xs text-slate-500">
              {[equipment.model, equipment.placa && `Placa ${equipment.placa}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full shrink-0">
          Inoperativo
        </span>
      </div>

      {roster.motivo && (
        <p className="text-sm text-red-800 bg-red-100 rounded px-2 py-1.5">
          Motivo: {roster.motivo}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {editable && (
        <div className="flex flex-wrap gap-2">
          <PhotoUploadButton
            label="Foto inicio"
            currentUrl={roster.fotoInicioUrl}
            onUpload={(file) => uploadRosterFoto(roster.id, "inicio", file)}
          />
          <PhotoUploadButton
            label="Foto fin"
            currentUrl={roster.fotoFinUrl}
            onUpload={(file) => uploadRosterFoto(roster.id, "fin", file)}
          />
        </div>
      )}

      {editable && (
        <button
          disabled={pending}
          onClick={handleResume}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm rounded-md py-2"
        >
          ▶ Ya está operativo / trabajando
        </button>
      )}
    </div>
  );
}
