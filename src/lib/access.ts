import { prisma } from "./prisma";

export class AccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

/**
 * Verifica que un OPERADOR pueda registrar/editar datos en este momento:
 * su cuenta debe estar activa (habilitada por el administrador) y la ventana
 * global de captura de datos debe estar abierta. El ADMIN siempre puede.
 */
export async function assertCanWrite(user: { id: string; role: string; active: boolean }) {
  if (user.role === "ADMIN") return;

  if (!user.active) {
    throw new AccessError(
      "Tu acceso fue revocado por el administrador. Solicita que te lo vuelva a habilitar.",
      403
    );
  }

  const settings = await getOrCreateSettings();
  if (!settings.dataEntryOpen) {
    throw new AccessError(
      "La captura de datos está cerrada. El administrador debe abrirla en el horario de trabajo.",
      403
    );
  }
}

/** Un registro solo puede editarse por su creador mientras la ventana esté abierta y sea el mismo día, o por el ADMIN. */
export function canEditRecord(
  user: { id: string; role: string },
  record: { createdById: string; locked: boolean; date: Date },
  dataEntryOpen: boolean
) {
  if (user.role === "ADMIN") return true;
  if (record.locked) return false;
  if (record.createdById !== user.id) return false;
  if (!dataEntryOpen) return false;

  const today = new Date();
  const sameDay =
    record.date.getFullYear() === today.getFullYear() &&
    record.date.getMonth() === today.getMonth() &&
    record.date.getDate() === today.getDate();
  return sameDay;
}
