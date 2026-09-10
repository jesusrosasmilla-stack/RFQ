/** Fecha "YYYY-MM-DD" -> Date a medianoche UTC (usada como clave de día, sin hora). */
export function parseDateParam(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayParam(): string {
  return toDateParam(new Date());
}

export function formatDateEs(d: Date): string {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "UTC" }).format(d);
}
