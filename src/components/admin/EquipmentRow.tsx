"use client";

import { useState, useTransition } from "react";
import type { Equipment } from "@prisma/client";
import { setEquipmentActive, updateEquipmentDetails } from "@/lib/actions/admin";

export function EquipmentRow({ equipment }: { equipment: Equipment }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(equipment.name);
  const [contratista, setContratista] = useState(equipment.contratista ?? "");
  const [model, setModel] = useState(equipment.model ?? "");
  const [placa, setPlaca] = useState(equipment.placa ?? "");
  const [costoHm, setCostoHm] = useState(equipment.costoHm?.toString() ?? "");
  const [volumen, setVolumen] = useState(equipment.volumen?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateEquipmentDetails(equipment.id, {
          name,
          model: model || undefined,
          placa: placa || undefined,
          costoHm: costoHm === "" ? null : Number(costoHm),
          contratista: contratista || undefined,
          volumen: volumen === "" ? null : Number(volumen),
        });
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  function handleCancel() {
    setName(equipment.name);
    setContratista(equipment.contratista ?? "");
    setModel(equipment.model ?? "");
    setPlaca(equipment.placa ?? "");
    setCostoHm(equipment.costoHm?.toString() ?? "");
    setVolumen(equipment.volumen?.toString() ?? "");
    setError(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-b border-slate-50 bg-slate-50/60">
        <td className="py-1.5 pr-2 font-medium">{equipment.code}</td>
        <td className="py-1.5 pr-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
          />
        </td>
        <td className="py-1.5 pr-2">
          <input
            value={contratista}
            onChange={(e) => setContratista(e.target.value)}
            placeholder="Contratista"
            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
          />
        </td>
        <td className="py-1.5 pr-2">
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Modelo"
            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
          />
        </td>
        <td className="py-1.5 pr-2">
          <input
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="Placa"
            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
          />
        </td>
        <td className="py-1.5 pr-2">
          <input
            type="number"
            step="0.1"
            min="0"
            value={volumen}
            onChange={(e) => setVolumen(e.target.value)}
            placeholder="m³"
            className="w-16 border border-slate-300 rounded px-1.5 py-1 text-xs"
          />
        </td>
        <td className="py-1.5 pr-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={costoHm}
            onChange={(e) => setCostoHm(e.target.value)}
            placeholder="0.00"
            className="w-24 border border-slate-300 rounded px-1.5 py-1 text-xs"
          />
        </td>
        <td className="py-1.5 pr-2" />
        <td className="py-1.5 pr-2 text-right">
          <div className="flex justify-end gap-1.5">
            <button
              disabled={pending}
              onClick={handleSave}
              className="text-xs px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50"
            >
              Guardar
            </button>
            <button onClick={handleCancel} className="text-xs px-2 py-1 text-slate-500 underline">
              Cancelar
            </button>
          </div>
          {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-50">
      <td className="py-1.5 pr-2 font-medium">{equipment.code}</td>
      <td className="py-1.5 pr-2 text-slate-600">{equipment.name}</td>
      <td className="py-1.5 pr-2 text-slate-500">{equipment.contratista ?? "—"}</td>
      <td className="py-1.5 pr-2 text-slate-500">{equipment.model ?? "—"}</td>
      <td className="py-1.5 pr-2 text-slate-500">{equipment.placa ?? "—"}</td>
      <td className="py-1.5 pr-2 text-slate-500">
        {equipment.volumen != null ? `${equipment.volumen} m³` : "—"}
      </td>
      <td className="py-1.5 pr-2 text-slate-500">
        {equipment.costoHm != null ? equipment.costoHm.toFixed(2) : "—"}
      </td>
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
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            Editar
          </button>
          <button
            disabled={pending}
            onClick={() => startTransition(() => setEquipmentActive(equipment.id, !equipment.active))}
            className="text-xs px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
          >
            {equipment.active ? "Desactivar" : "Activar"}
          </button>
        </div>
      </td>
    </tr>
  );
}
