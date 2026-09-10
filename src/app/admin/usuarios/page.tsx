import { prisma } from "@/lib/prisma";
import { getOrCreateSettings } from "@/lib/access";
import { DataEntrySwitch } from "@/components/admin/DataEntrySwitch";
import { UserRow } from "@/components/admin/UserRow";
import { NewOperatorForm } from "@/components/admin/NewOperatorForm";

export default async function UsuariosPage() {
  const settings = await getOrCreateSettings();
  const users = await prisma.user.findMany({
    where: { role: "OPERATOR" },
    orderBy: { createdAt: "asc" },
  });
  const recentLogs = await prisma.accessLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Gestión de acceso y usuarios</h1>

      <DataEntrySwitch
        dataEntryOpen={settings.dataEntryOpen}
        openedBy={settings.dataEntryOpenedBy}
        openedAtLabel={
          settings.dataEntryOpenedAt
            ? settings.dataEntryOpenedAt.toLocaleTimeString("es-PE")
            : null
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Crear operador</h2>
        <NewOperatorForm />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Operadores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Usuario</th>
                <th className="py-2 pr-2">Acceso</th>
                <th className="py-2 pr-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={{ id: u.id, name: u.name, username: u.username, active: u.active }} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-slate-400 text-sm">
                    No hay operadores registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Historial de accesos recientes</h2>
        <ul className="text-xs text-slate-600 space-y-1">
          {recentLogs.map((log) => (
            <li key={log.id}>
              {new Date(log.createdAt).toLocaleString("es-PE")} — {log.user.name}:{" "}
              <strong>{log.action === "GRANTED" ? "Acceso otorgado" : "Acceso revocado"}</strong>{" "}
              por {log.byAdmin ?? "—"}
            </li>
          ))}
          {recentLogs.length === 0 && <li className="text-slate-400">Sin actividad registrada.</li>}
        </ul>
      </div>
    </div>
  );
}
