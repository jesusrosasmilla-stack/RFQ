import { prisma } from "@/lib/prisma";
import { parseDateParam, todayParam, formatDateEs } from "@/lib/date";
import { calcularResumenLineaAmarilla } from "@/lib/metrics";
import { getOrCreateSettings } from "@/lib/access";
import { DateNav } from "@/components/DateNav";
import { PlanRow } from "@/components/admin/PlanRow";

export default async function PlanificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateQuery } = await searchParams;
  const dateStr = dateQuery || todayParam();
  const date = parseDateParam(dateStr);
  const settings = await getOrCreateSettings();

  const equipment = await prisma.equipment.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { code: "asc" }],
    include: {
      dailyPlans: { where: { date } },
      yellowRecords: { where: { date }, include: { stops: true } },
      whiteRecords: { where: { date }, include: { trips: true } },
    },
  });

  const rows = equipment.map((eq) => {
    const plan = eq.dailyPlans[0] ?? null;
    let actual = 0;
    if (eq.category === "LINEA_AMARILLA") {
      const rec = eq.yellowRecords[0];
      if (rec) {
        const resumen = calcularResumenLineaAmarilla(
          rec.horometroInicial,
          rec.horometroFinal,
          rec.stops,
          settings
        );
        actual = resumen.hmHorometro ?? 0;
      }
    } else {
      actual = eq.whiteRecords[0]?.trips.length ?? 0;
    }
    const cumplimiento =
      plan && plan.valorPlanificado > 0
        ? Math.round((actual / plan.valorPlanificado) * 10000) / 100
        : null;
    return { equipment: eq, plan, actual, cumplimiento };
  });

  const conPlan = rows.filter((r) => r.plan);
  const cumplidos = conPlan.filter((r) => (r.cumplimiento ?? 0) >= 100);
  const ppc = conPlan.length > 0 ? Math.round((cumplidos.length / conPlan.length) * 10000) / 100 : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Planificación (Last Planner)</h1>
          <p className="text-sm text-slate-500">{formatDateEs(date)}</p>
        </div>
        <DateNav basePath="/admin/planificacion" date={dateStr} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <p className="text-sm text-slate-600">
          PPC (Percent Plan Complete) del día — porcentaje de equipos que cumplieron o superaron
          su meta planificada:
        </p>
        <p className="text-3xl font-bold text-slate-800 mt-1">
          {ppc != null ? `${ppc}%` : "Sin metas definidas"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {cumplidos.length} de {conPlan.length} equipos con meta cumplida.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-2">Equipo</th>
              <th className="py-2 pr-2">Métrica</th>
              <th className="py-2 pr-2">Planificado</th>
              <th className="py-2 pr-2">Real</th>
              <th className="py-2 pr-2">% Cumplimiento</th>
              <th className="py-2 pr-2">Causa de no cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <PlanRow
                key={r.equipment.id}
                equipmentId={r.equipment.id}
                equipmentLabel={`${r.equipment.code} · ${r.equipment.name}`}
                metrica={r.equipment.category === "LINEA_AMARILLA" ? "HM" : "VIAJES"}
                date={dateStr}
                planned={r.plan?.valorPlanificado ?? null}
                planId={r.plan?.id ?? null}
                actual={r.actual}
                cumplimiento={r.cumplimiento}
                causa={r.plan?.causaNoCumplimiento ?? null}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
