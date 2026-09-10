import type { Settings } from "@prisma/client";

export function AccessBanner({
  settings,
  isAdmin,
  userActive,
}: {
  settings: Settings;
  isAdmin: boolean;
  userActive: boolean;
}) {
  if (isAdmin) {
    return (
      <div
        className={`rounded-md px-3 py-2 text-sm border ${
          settings.dataEntryOpen
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
        }`}
      >
        Captura de datos {settings.dataEntryOpen ? "ABIERTA" : "CERRADA"} para operadores. Puedes
        administrarla en Usuarios.
      </div>
    );
  }

  if (!userActive) {
    return (
      <div className="rounded-md px-3 py-2 text-sm border bg-red-50 border-red-200 text-red-700">
        Tu acceso está deshabilitado. Pide al administrador que te lo habilite en tu horario de
        trabajo.
      </div>
    );
  }

  if (!settings.dataEntryOpen) {
    return (
      <div className="rounded-md px-3 py-2 text-sm border bg-amber-50 border-amber-200 text-amber-700">
        La captura de datos está cerrada por el administrador en este momento. Podrás ver tus
        registros pero no editarlos.
      </div>
    );
  }

  return (
    <div className="rounded-md px-3 py-2 text-sm border bg-emerald-50 border-emerald-200 text-emerald-700">
      Captura de datos habilitada. Recuerda registrar horómetro y paradas apenas ocurran.
    </div>
  );
}
