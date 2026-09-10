"use client";

import { useTransition } from "react";
import type { Equipment } from "@prisma/client";
import { setEquipmentActive } from "@/lib/actions/admin";

export function EquipmentRow({ equipment }: { equipment: Equipment }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-slate-50">
      <td className="py-1.5 pr-2 font-medium">{equipment.code}</td>
      <td className="py-1.5 pr-2 text-slate-600">{equipment.name}</td>
      <td className="py-1.5 pr-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            equipment.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {equipment.active ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-1.5 pr-2 text-right">
        <button
          disabled={pending}
          onClick={() => startTransition(() => setEquipmentActive(equipment.id, !equipment.active))}
          className="text-xs px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
        >
          {equipment.active ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
