"use client";

import { useState, useTransition } from "react";
import { createOperator } from "@/lib/actions/admin";

export function NewOperatorForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createOperator({ name, username, password });
        setName("");
        setUsername("");
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear operador.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Nombre completo</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Usuario</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Contraseña</label>
        <input
          type="text"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm rounded-md px-4 py-1.5"
      >
        Crear operador
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  );
}
