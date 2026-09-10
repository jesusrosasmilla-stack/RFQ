"use client";

import { useState, useTransition } from "react";
import { createEquipment } from "@/lib/actions/admin";

export function NewEquipmentForm() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [placa, setPlaca] = useState("");
  const [costoHm, setCostoHm] = useState("");
  const [contratista, setContratista] = useState("");
  const [volumen, setVolumen] = useState("");
  const [category, setCategory] = useState<"LINEA_AMARILLA" | "LINEA_BLANCA">("LINEA_AMARILLA");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createEquipment({
          code,
          name,
          model: model || undefined,
          placa: placa || undefined,
          costoHm: costoHm === "" ? null : Number(costoHm),
          contratista: contratista || undefined,
          volumen: volumen === "" ? null : Number(volumen),
          category,
        });
        setCode("");
        setName("");
        setModel("");
        setPlaca("");
        setCostoHm("");
        setContratista("");
        setVolumen("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear equipo.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Código</label>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-24"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Descripción / Nombre</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Contratista (opcional)</label>
        <input
          value={contratista}
          onChange={(e) => setContratista(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Modelo (opcional)</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Placa (opcional)</label>
        <input
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-28"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Costo por HM (opcional)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={costoHm}
          onChange={(e) => setCostoHm(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-28"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Volumen m³ (opcional)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={volumen}
          onChange={(e) => setVolumen(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-24"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        >
          <option value="LINEA_AMARILLA">Línea amarilla</option>
          <option value="LINEA_BLANCA">Volquete (línea blanca)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm rounded-md px-4 py-1.5"
      >
        Agregar
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  );
}
