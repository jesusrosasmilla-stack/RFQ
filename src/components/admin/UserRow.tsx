"use client";

import { useState, useTransition } from "react";
import { setUserActive, resetOperatorPassword } from "@/lib/actions/admin";

export function UserRow({
  user,
}: {
  user: { id: string; name: string; username: string; active: boolean };
}) {
  const [pending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
  const [password, setPassword] = useState("");

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await resetOperatorPassword(user.id, password);
      setPassword("");
      setShowReset(false);
    });
  }

  return (
    <tr className="border-b border-slate-50">
      <td className="py-2 pr-2">{user.name}</td>
      <td className="py-2 pr-2 text-slate-500">{user.username}</td>
      <td className="py-2 pr-2">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            user.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {user.active ? "Habilitado" : "Deshabilitado"}
        </span>
      </td>
      <td className="py-2 pr-2">
        <div className="flex flex-wrap gap-2">
          <button
            disabled={pending}
            onClick={() => startTransition(() => setUserActive(user.id, !user.active))}
            className={`text-xs px-2 py-1 rounded-md text-white disabled:opacity-50 ${
              user.active ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {user.active ? "Revocar acceso" : "Otorgar acceso"}
          </button>
          <button
            onClick={() => setShowReset((v) => !v)}
            className="text-xs px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            Cambiar contraseña
          </button>
        </div>
        {showReset && (
          <form onSubmit={handleReset} className="mt-2 flex gap-2">
            <input
              type="text"
              required
              minLength={6}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1 text-xs"
            />
            <button
              type="submit"
              disabled={pending}
              className="text-xs px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white"
            >
              Guardar
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}
