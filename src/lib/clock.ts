/** Hora actual del dispositivo en formato "HH:mm". Úsalo solo dentro de manejadores de evento (no durante el render). */
export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
