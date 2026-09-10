import { prisma } from "@/lib/prisma";
import { parseDateParam, todayParam, formatDateEs } from "@/lib/date";
import { DateNav } from "@/components/DateNav";
import { RecordRow } from "@/components/admin/RecordRow";

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateQuery } = await searchParams;
  const dateStr = dateQuery || todayParam();
  const date = parseDateParam(dateStr);

  const yellow = await prisma.yellowLineRecord.findMany({
    where: { date },
    include: { equipment: true, createdBy: true, stops: true },
    orderBy: { equipment: { code: "asc" } },
  });
  const white = await prisma.whiteLineRecord.findMany({
    where: { date },
    include: { equipment: true, createdBy: true, trips: true },
    orderBy: { equipment: { code: "asc" } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Auditoría de registros</h1>
          <p className="text-sm text-slate-500">{formatDateEs(date)}</p>
        </div>
        <DateNav basePath="/admin/registros" date={dateStr} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <h2 className="font-semibold text-slate-800 mb-3">Línea amarilla</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-2">Equipo</th>
              <th className="py-2 pr-2">Registrado por</th>
              <th className="py-2 pr-2">Horómetro (ini/fin)</th>
              <th className="py-2 pr-2">Paradas</th>
              <th className="py-2 pr-2">Estado</th>
              <th className="py-2 pr-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {yellow.map((r) => (
              <RecordRow
                key={r.id}
                kind="yellow"
                id={r.id}
                equipmentLabel={`${r.equipment.code} · ${r.equipment.name}`}
                createdBy={r.createdBy.name}
                locked={r.locked}
                detail={`${r.horometroInicial} → ${r.horometroFinal ?? "—"}`}
                extra={`${r.stops.length} parada(s)`}
              />
            ))}
            {yellow.length === 0 && (
              <tr>
                <td colSpan={6} className="py-3 text-slate-400 text-sm">
                  Sin registros de línea amarilla en esta fecha.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <h2 className="font-semibold text-slate-800 mb-3">Volquetes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-2">Equipo</th>
              <th className="py-2 pr-2">Registrado por</th>
              <th className="py-2 pr-2">Viajes</th>
              <th className="py-2 pr-2"></th>
              <th className="py-2 pr-2">Estado</th>
              <th className="py-2 pr-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {white.map((r) => (
              <RecordRow
                key={r.id}
                kind="white"
                id={r.id}
                equipmentLabel={`${r.equipment.code} · ${r.equipment.name}`}
                createdBy={r.createdBy.name}
                locked={r.locked}
                detail={`${r.trips.length} viaje(s)`}
                extra=""
              />
            ))}
            {white.length === 0 && (
              <tr>
                <td colSpan={6} className="py-3 text-slate-400 text-sm">
                  Sin registros de volquetes en esta fecha.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
