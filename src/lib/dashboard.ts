import { calcularResumenLineaAmarilla, calcularCicloViaje, promedioRobusto, type WorkdayConfig } from "./metrics";
import { durationMinutes } from "./time";
import { toDateParam } from "./date";
import { STOP_TYPE_LABELS } from "./labels";

interface StopLite {
  horaInicio: string;
  horaFin: string;
  tipo: string;
}
interface YellowRecordLite {
  date: Date;
  horometroInicial: number;
  horometroFinal: number | null;
  stops: StopLite[];
}
interface TripLite {
  numero: number;
  carguioInicio: string;
  carguioFin: string;
  descargaInicio: string;
  descargaFin: string;
  retornoFin: string | null;
}
interface WhiteRecordLite {
  date: Date;
  trips: TripLite[];
}
interface PlanLite {
  date: Date;
  valorPlanificado: number;
}
export interface EquipmentLite {
  code: string;
  name: string;
  category: "LINEA_AMARILLA" | "LINEA_BLANCA";
  costoHm: number | null;
  yellowRecords: YellowRecordLite[];
  whiteRecords: WhiteRecordLite[];
  dailyPlans: PlanLite[];
}

export interface DayMetrics {
  dateStr: string;
  yellowRows: {
    code: string;
    name: string;
    eficiencia: number | null;
    paradasHoras: number;
    hmHorometro: number | null;
    costo: number | null;
  }[];
  whiteRows: { code: string; name: string; viajes: number; cicloPromedio: number | null }[];
  avgEficiencia: number | null;
  totalParadasHoras: number;
  totalViajes: number;
  avgCiclo: number | null;
  causas: { label: string; value: number }[];
  ppc: number | null;
  planCount: number;
  planCumplidos: number;
  totalCosto: number;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

export function computeDayMetrics(
  dateStr: string,
  equipment: EquipmentLite[],
  workday: WorkdayConfig
): DayMetrics {
  const yellowRows: DayMetrics["yellowRows"] = [];
  const whiteRows: DayMetrics["whiteRows"] = [];
  const causasMin: Record<string, number> = {};
  let planCount = 0;
  let planCumplidos = 0;

  for (const eq of equipment) {
    const plan = eq.dailyPlans.find((p) => toDateParam(p.date) === dateStr) ?? null;
    let actual = 0;

    if (eq.category === "LINEA_AMARILLA") {
      const rec = eq.yellowRecords.find((r) => toDateParam(r.date) === dateStr) ?? null;
      if (rec) {
        const resumen = calcularResumenLineaAmarilla(
          rec.horometroInicial,
          rec.horometroFinal,
          rec.stops,
          workday
        );
        const costo =
          resumen.hmHorometro != null && eq.costoHm != null
            ? Math.round(resumen.hmHorometro * eq.costoHm * 100) / 100
            : null;
        yellowRows.push({
          code: eq.code,
          name: eq.name,
          eficiencia: resumen.eficiencia,
          paradasHoras: resumen.paradasHoras,
          hmHorometro: resumen.hmHorometro,
          costo,
        });
        actual = resumen.hmHorometro ?? 0;
        for (const s of rec.stops) {
          const label = STOP_TYPE_LABELS[s.tipo] ?? s.tipo;
          causasMin[label] = (causasMin[label] ?? 0) + durationMinutes(s.horaInicio, s.horaFin);
        }
      }
    } else {
      const rec = eq.whiteRecords.find((r) => toDateParam(r.date) === dateStr) ?? null;
      if (rec) {
        const computed = rec.trips.map((t) => calcularCicloViaje(t, t.numero));
        const stats = promedioRobusto(computed.map((c) => c.cicloTotalMin));
        whiteRows.push({
          code: eq.code,
          name: eq.name,
          viajes: rec.trips.length,
          cicloPromedio: stats.promedio,
        });
        actual = rec.trips.length;
      }
    }

    if (plan) {
      planCount++;
      if (actual >= plan.valorPlanificado) planCumplidos++;
    }
  }

  return {
    dateStr,
    yellowRows,
    whiteRows,
    avgEficiencia: mean(yellowRows.map((r) => r.eficiencia).filter((v): v is number => v != null)),
    totalParadasHoras:
      Math.round(yellowRows.reduce((a, r) => a + r.paradasHoras, 0) * 100) / 100,
    totalViajes: whiteRows.reduce((a, r) => a + r.viajes, 0),
    avgCiclo: mean(whiteRows.map((r) => r.cicloPromedio).filter((v): v is number => v != null)),
    causas: Object.entries(causasMin).map(([label, value]) => ({ label, value })),
    ppc: planCount > 0 ? Math.round((planCumplidos / planCount) * 10000) / 100 : null,
    planCount,
    planCumplidos,
    totalCosto:
      Math.round(
        yellowRows.reduce((a, r) => a + (r.costo ?? 0), 0) * 100
      ) / 100,
  };
}
