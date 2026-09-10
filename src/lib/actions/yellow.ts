"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertCanWrite, canEditRecord, getOrCreateSettings } from "@/lib/access";
import { parseDateParam } from "@/lib/date";
import { isValidHHMM } from "@/lib/time";

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autenticado.");
  return session;
}

export async function upsertYellowRecord(input: {
  equipmentId: string;
  date: string;
  horometroInicial: number;
  horometroFinal?: number | null;
}) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  const date = parseDateParam(input.date);
  const existing = await prisma.yellowLineRecord.findUnique({
    where: { equipmentId_date: { equipmentId: input.equipmentId, date } },
  });

  if (existing) {
    const settings = await getOrCreateSettings();
    if (!canEditRecord(session.user, existing, settings.dataEntryOpen)) {
      throw new Error("Este registro ya no se puede editar. Solo el administrador puede modificarlo.");
    }
    await prisma.yellowLineRecord.update({
      where: { id: existing.id },
      data: {
        horometroInicial: input.horometroInicial,
        horometroFinal: input.horometroFinal ?? existing.horometroFinal,
      },
    });
  } else {
    await prisma.yellowLineRecord.create({
      data: {
        equipmentId: input.equipmentId,
        date,
        horometroInicial: input.horometroInicial,
        horometroFinal: input.horometroFinal ?? null,
        createdById: session.user.id,
      },
    });
  }

  revalidatePath("/captura/amarilla");
  revalidatePath("/dashboard");
}

export async function addYellowStop(input: {
  recordId: string;
  horaInicio: string;
  horaFin: string;
  tipo: "FALLA_MECANICA" | "MANTENIMIENTO" | "CLIMA" | "FALTA_OPERADOR" | "FALTA_MATERIAL" | "OTRO";
  observacion?: string;
}) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  if (!isValidHHMM(input.horaInicio) || !isValidHHMM(input.horaFin)) {
    throw new Error("Hora inválida. Usa formato HH:mm.");
  }

  const record = await prisma.yellowLineRecord.findUnique({ where: { id: input.recordId } });
  if (!record) throw new Error("Registro no encontrado.");

  const settings = await getOrCreateSettings();
  if (!canEditRecord(session.user, record, settings.dataEntryOpen)) {
    throw new Error("Este registro ya no se puede editar.");
  }

  await prisma.yellowLineStop.create({
    data: {
      recordId: input.recordId,
      horaInicio: input.horaInicio,
      horaFin: input.horaFin,
      tipo: input.tipo,
      observacion: input.observacion || null,
    },
  });

  revalidatePath("/captura/amarilla");
  revalidatePath("/dashboard");
}

export async function deleteYellowStop(stopId: string) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  const stop = await prisma.yellowLineStop.findUnique({
    where: { id: stopId },
    include: { record: true },
  });
  if (!stop) return;

  const settings = await getOrCreateSettings();
  if (!canEditRecord(session.user, stop.record, settings.dataEntryOpen)) {
    throw new Error("Este registro ya no se puede editar.");
  }

  await prisma.yellowLineStop.delete({ where: { id: stopId } });
  revalidatePath("/captura/amarilla");
  revalidatePath("/dashboard");
}
