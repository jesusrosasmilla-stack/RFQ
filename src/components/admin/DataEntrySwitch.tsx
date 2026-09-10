"use client";

import { useTransition } from "react";
import { setDataEntryOpen } from "@/lib/actions/admin";

export function DataEntrySwitch({
  dataEntryOpen,
  openedBy,
  openedAtLabel,
}: {
  dataEntryOpen: boolean;
  openedBy: string | null;
  openedAtLabel: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`rounded-xl border shadow-sm p-4 flex items-center justify-between ${
        dataEntryOpen ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div>
        <h2 className="font-semibold text-slate-800">
          Captura de datos: {dataEntryOpen ? "ABIERTA" : "CERRADA"}
        </h2>
        <p className="text-xs text-slate-500">
          Ábrela al iniciar el turno (07:00) y ciérrala al finalizar (18:00). Mientras esté
          cerrada, los operadores solo pueden ver sus registros, no modificarlos.
          {dataEntryOpen && openedBy && (
            <>
              {" "}
              Abierta por {openedBy}
              {openedAtLabel ? ` a las ${openedAtLabel}` : ""}.
            </>
          )}
        </p>
      </div>
      <button
        disabled={pending}
        onClick={() => startTransition(() => setDataEntryOpen(!dataEntryOpen))}
        className={`px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 ${
          dataEntryOpen ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {dataEntryOpen ? "Cerrar captura" : "Abrir captura"}
      </button>
    </div>
  );
}
