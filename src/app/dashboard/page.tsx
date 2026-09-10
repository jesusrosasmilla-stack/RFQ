import { prisma } from "@/lib/prisma";
import { getOrCreateSettings } from "@/lib/access";
import { parseDateParam, toDateParam, todayParam, formatDateEs } from "@/lib/date";
import { computeDayMetrics, type EquipmentLite } from "@/lib/dashboard";
import { statusForEficiencia, statusForCumplimiento } from "@/lib/colors";
import { DateNav } from "@/components/DateNav";
import { KpiCard } from "@/components/KpiCard";
import { StatusBarChart } from "@/components/charts/StatusBarChart";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { CausesPieChart } from "@/components/charts/CausesPieChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { StatusLegend } from "@/components/charts/StatusLegend";

const TREND_DAYS = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const settings = await getOrCreateSettings();
  const { date: dateQuery } = await searchParams;
  const dateStr = dateQuery || todayParam();
  const date = parseDateParam(dateStr);

  const rangeStart = new Date(date);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - (TREND_DAYS - 1));

  const equipment = (await prisma.equipment.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { code: "asc" }],
    include: {
      yellowRecords: {
        where: { date: { gte: rangeStart, lte: date } },
        include: { stops: true },
      },
      whiteRecords: {
        where: { date: { gte: rangeStart, lte: date } },
        include: { trips: true },
      },
      dailyPlans: { where: { date: { gte: rangeStart, lte: date } } },
    },
  })) as unknown as EquipmentLite[];

  const workday = {
    workStart: settings.workStart,
    workEnd: settings.workEnd,
    lunchStart: settings.lunchStart,
    lunchEnd: settings.lunchEnd,
  };

  const today = computeDayMetrics(dateStr, equipment, workday);

  const trend = [];
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(rangeStart);
    d.setUTCDate(d.getUTCDate() + i);
    const ds = toDateParam(d);
    const m = computeDayMetrics(ds, equipment, workday);
    trend.push({
      date: ds.slice(5),
      eficiencia: m.avgEficiencia,
      ppc: m.ppc,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Productividad</h1>
          <p className="text-sm text-slate-500">{formatDateEs(date)}</p>
        </div>
        <DateNav basePath="/dashboard" date={dateStr} />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <KpiCard
          label="Eficiencia línea amarilla"
          value={today.avgEficiencia != null ? `${today.avgEficiencia}%` : "—"}
          sub="Promedio HM horómetro / horas disponibles"
          status={today.avgEficiencia != null ? statusForEficiencia(today.avgEficiencia) : undefined}
        />
        <KpiCard
          label="PPC (Last Planner)"
          value={today.ppc != null ? `${today.ppc}%` : "Sin metas"}
          sub={`${today.planCumplidos}/${today.planCount} equipos cumplieron la meta`}
          status={today.ppc != null ? statusForCumplimiento(today.ppc) : undefined}
        />
        <KpiCard
          label="Horas muertas (línea amarilla)"
          value={`${today.totalParadasHoras} h`}
          sub="Paradas dentro de jornada, sin refrigerio"
        />
        <KpiCard
          label="Viajes de volquetes"
          value={`${today.totalViajes}`}
          sub={today.avgCiclo != null ? `Ciclo promedio depurado: ${today.avgCiclo} min` : "Sin viajes"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-1">Eficiencia por equipo (línea amarilla)</h2>
          <p className="text-xs text-slate-500 mb-2">HM horómetro vs. horas disponibles de la jornada</p>
          <StatusBarChart
            data={today.yellowRows
              .filter((r) => r.eficiencia != null)
              .map((r) => ({ label: r.code, value: r.eficiencia as number }))}
            unit="%"
            mode="eficiencia"
          />
          <StatusLegend
            items={[
              { label: "≥ 85% bueno", status: "good" },
              { label: "65–84% regular", status: "warning" },
              { label: "< 65% bajo", status: "critical" },
            ]}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-1">Horas muertas por equipo</h2>
          <p className="text-xs text-slate-500 mb-2">Paradas y fallas mecánicas dentro de la jornada</p>
          <SimpleBarChart
            data={today.yellowRows.map((r) => ({ label: r.code, value: r.paradasHoras }))}
            unit=" h"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-1">Causas de tiempo muerto</h2>
          <p className="text-xs text-slate-500 mb-2">Minutos acumulados por tipo de parada</p>
          <CausesPieChart data={today.causas} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-1">Viajes por volquete</h2>
          <p className="text-xs text-slate-500 mb-2">Número de ciclos completados en el día</p>
          <SimpleBarChart
            data={today.whiteRows.map((r) => ({ label: r.code, value: r.viajes }))}
            unit=""
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-1">Ciclo promedio por volquete</h2>
          <p className="text-xs text-slate-500 mb-2">
            Promedio depurado (se descartan tiempos atípicos con el método de rango intercuartílico)
          </p>
          <SimpleBarChart
            data={today.whiteRows
              .filter((r) => r.cicloPromedio != null)
              .map((r) => ({ label: r.code, value: r.cicloPromedio as number }))}
            unit=" min"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-1">Tendencia de productividad (últimos {TREND_DAYS} días)</h2>
          <p className="text-xs text-slate-500 mb-2">Eficiencia de línea amarilla y cumplimiento de plan (PPC)</p>
          <TrendChart data={trend} />
        </div>
      </div>
    </div>
  );
}
