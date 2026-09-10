/** Utilidades para manejo de horas en formato "HH:mm" dentro de una jornada laboral. */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToHours(min: number): number {
  return Math.round((min / 60) * 100) / 100;
}

/** Duración en minutos entre dos horas "HH:mm". Si fin < inicio se asume que cruza medianoche. */
export function durationMinutes(start: string, end: string): number {
  const s = toMinutes(start);
  const e = toMinutes(end);
  return e >= s ? e - s : 24 * 60 - s + e;
}

/** Recorta un intervalo [start,end] (en minutos) a los límites de la jornada [dayStart,dayEnd]. */
export function clipMinutes(start: number, end: number, dayStart: number, dayEnd: number): number {
  const s = Math.max(start, dayStart);
  const e = Math.min(end, dayEnd);
  return Math.max(0, e - s);
}

/** Minutos de solape entre dos intervalos dados en minutos absolutos del día. */
export function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const s = Math.max(aStart, bStart);
  const e = Math.min(aEnd, bEnd);
  return Math.max(0, e - s);
}

export function isValidHHMM(v: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}
