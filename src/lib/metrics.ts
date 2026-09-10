import { toMinutes, minutesToHours, clipMinutes, overlapMinutes } from "./time";

export interface WorkdayConfig {
  workStart: string; // "07:00"
  workEnd: string; // "18:00"
  lunchStart: string; // "12:00"
  lunchEnd: string; // "13:00"
}

export interface StopInterval {
  horaInicio: string;
  horaFin: string;
}

/**
 * Calcula el resumen de línea amarilla para un equipo/día:
 * - hmHorometro: horas marcadas por el horómetro (final - inicial)
 * - horasDisponibles: jornada - refrigerio - paradas (netas, sin doble conteo con el refrigerio)
 * - paradasHoras: horas de parada efectivamente dentro de la jornada (fuera del refrigerio)
 * - eficiencia: hmHorometro / horasDisponibles * 100
 */
export function calcularResumenLineaAmarilla(
  horometroInicial: number,
  horometroFinal: number | null,
  stops: StopInterval[],
  cfg: WorkdayConfig
) {
  const dayStart = toMinutes(cfg.workStart);
  const dayEnd = toMinutes(cfg.workEnd);
  const lunchStart = toMinutes(cfg.lunchStart);
  const lunchEnd = toMinutes(cfg.lunchEnd);

  const jornadaMin = Math.max(0, dayEnd - dayStart);
  const refrigerioMin = Math.max(0, lunchEnd - lunchStart);

  let paradasNetMin = 0;
  for (const stop of stops) {
    const s = toMinutes(stop.horaInicio);
    const e = toMinutes(stop.horaFin);
    const clipped = clipMinutes(s, e, dayStart, dayEnd);
    const overlapLunch = overlapMinutes(
      Math.max(s, dayStart),
      Math.min(e, dayEnd),
      lunchStart,
      lunchEnd
    );
    paradasNetMin += Math.max(0, clipped - overlapLunch);
  }

  const horasDisponiblesMin = Math.max(0, jornadaMin - refrigerioMin - paradasNetMin);
  const hmHorometro =
    horometroFinal != null ? Math.round((horometroFinal - horometroInicial) * 100) / 100 : null;

  const horasDisponibles = minutesToHours(horasDisponiblesMin);
  const paradasHoras = minutesToHours(paradasNetMin);
  const jornadaHoras = minutesToHours(jornadaMin);
  const refrigerioHoras = minutesToHours(refrigerioMin);

  const eficiencia =
    hmHorometro != null && horasDisponibles > 0
      ? Math.round((hmHorometro / horasDisponibles) * 10000) / 100
      : null;

  return {
    jornadaHoras,
    refrigerioHoras,
    paradasHoras,
    horasDisponibles,
    hmHorometro,
    eficiencia,
  };
}

export interface TripInput {
  carguioInicio: string;
  carguioFin: string;
  descargaInicio: string;
  descargaFin: string;
  retornoFin?: string | null;
}

export interface TripComputed {
  numero: number;
  tiempoCarguioMin: number;
  tiempoDesplazamientoMin: number;
  tiempoDescargaMin: number;
  tiempoRetornoMin: number | null;
  cicloTotalMin: number;
}

export function calcularCicloViaje(trip: TripInput, numero: number): TripComputed {
  const t1 = toMinutes(trip.carguioInicio);
  const t2 = toMinutes(trip.carguioFin);
  const t3 = toMinutes(trip.descargaInicio);
  const t4 = toMinutes(trip.descargaFin);
  const t5 = trip.retornoFin ? toMinutes(trip.retornoFin) : null;

  const norm = (a: number, b: number) => (b >= a ? b - a : 24 * 60 - a + b);

  const tiempoCarguioMin = norm(t1, t2);
  const tiempoDesplazamientoMin = norm(t2, t3);
  const tiempoDescargaMin = norm(t3, t4);
  const tiempoRetornoMin = t5 != null ? norm(t4, t5) : null;
  const cicloTotalMin = t5 != null ? norm(t1, t5) : norm(t1, t4);

  return {
    numero,
    tiempoCarguioMin,
    tiempoDesplazamientoMin,
    tiempoDescargaMin,
    tiempoRetornoMin,
    cicloTotalMin,
  };
}

/**
 * Estadística robusta del ciclo promedio: usa el método de rango intercuartílico (IQR)
 * para descartar valores atípicos (paradas largas, esperas anormales) antes de promediar.
 */
export function promedioRobusto(valores: number[]) {
  if (valores.length === 0) {
    return { promedio: null as number | null, promedioBruto: null as number | null, n: 0, descartados: 0 };
  }
  const sorted = [...valores].sort((a, b) => a - b);
  const promedioBruto = sorted.reduce((a, b) => a + b, 0) / sorted.length;

  if (sorted.length < 4) {
    return { promedio: promedioBruto, promedioBruto, n: sorted.length, descartados: 0 };
  }

  const q = (p: number) => {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  const q1 = q(0.25);
  const q3 = q(0.75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const filtered = sorted.filter((v) => v >= lower && v <= upper);
  const promedio = filtered.length
    ? filtered.reduce((a, b) => a + b, 0) / filtered.length
    : promedioBruto;

  return {
    promedio: Math.round(promedio * 100) / 100,
    promedioBruto: Math.round(promedioBruto * 100) / 100,
    n: sorted.length,
    descartados: sorted.length - filtered.length,
  };
}
