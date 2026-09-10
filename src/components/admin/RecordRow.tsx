"use client";

import { useTransition } from "react";
import { setRecordLocked, deleteRecord } from "@/lib/actions/admin";

export function RecordRow({
  kind,
  id,
  equipmentLabel,
  createdBy,
  locked,
  detail,
  extra,
}: {
  kind: "yellow" | "white";
  id: string;
  equipmentLabel: string;
  createdBy: string;
  locked: boolean;
  detail: string;
  extra: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("¿Eliminar este registro y todos sus datos asociados? Esta acción no se puede deshacer.")) {
      return;
    }
    startTransition(() => deleteRecord(kind, id));
  }

  return (
    <tr className="border-b border-slate-50">
      <td className="py-2 pr-2">{equipmentLabel}</td>
      <td className="py-2 pr-2 text-slate-500">{createdBy}</td>
      <td className="py-2 pr-2">{detail}</td>
      <td className="py-2 pr-2 text-slate-500">{extra}</td>
      <td className="py-2 pr-2">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            locked ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {locked ? "Bloqueado" : "Editable"}
        </span>
      </td>
      <td className="py-2 pr-2">
        <div className="flex gap-2">
          <button
            disabled={pending}
            onClick={() => startTransition(() => setRecordLocked(kind, id, !locked))}
            className="text-xs px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
          >
            {locked ? "Desbloquear" : "Bloquear"}
          </button>
          <button
            disabled={pending}
            onClick={handleDelete}
            className="text-xs px-2 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}
