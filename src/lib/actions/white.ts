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

export async function getOrCreateWhiteRecord(equipmentId: string, dateStr: string) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  const date = parseDateParam(dateStr);
  const existing = await prisma.whiteLineRecord.findUnique({
    where: { equipmentId_date: { equipmentId, date } },
  });
  if (existing) return existing.id;

  const created = await prisma.whiteLineRecord.create({
    data: { equipmentId, date, createdById: session.user.id },
  });
  revalidatePath("/captura/blanca");
  return created.id;
}

export async function addTripForEquipment(input: {
  equipmentId: string;
  date: string;
  carguioInicio: string;
  carguioFin: string;
  descargaInicio: string;
  descargaFin: string;
  retornoFin?: string | null;
  observacion?: string;
  tipoMaterial?: string | null;
  origen?: string | null;
  destino?: string | null;
  equipoCarguioId?: string | null;
}) {
  const recordId = await getOrCreateWhiteRecord(input.equipmentId, input.date);
  return addTrip({ ...input, recordId });
}

export async function addTrip(input: {
  recordId: string;
  carguioInicio: string;
  carguioFin: string;
  descargaInicio: string;
  descargaFin: string;
  retornoFin?: string | null;
  observacion?: string;
  tipoMaterial?: string | null;
  origen?: string | null;
  destino?: string | null;
  equipoCarguioId?: string | null;
}) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  for (const v of [input.carguioInicio, input.carguioFin, input.descargaInicio, input.descargaFin]) {
    if (!isValidHHMM(v)) throw new Error("Hora inválida. Usa formato HH:mm.");
  }
  if (input.retornoFin && !isValidHHMM(input.retornoFin)) {
    throw new Error("Hora de retorno inválida.");
  }

  const record = await prisma.whiteLineRecord.findUnique({
    where: { id: input.recordId },
    include: { trips: true },
  });
  if (!record) throw new Error("Registro no encontrado.");

  const settings = await getOrCreateSettings();
  if (!canEditRecord(session.user, record, settings.dataEntryOpen)) {
    throw new Error("Este registro ya no se puede editar.");
  }

  const numero = record.trips.length + 1;

  await prisma.trip.create({
    data: {
      recordId: input.recordId,
      numero,
      carguioInicio: input.carguioInicio,
      carguioFin: input.carguioFin,
      descargaInicio: input.descargaInicio,
      descargaFin: input.descargaFin,
      retornoFin: input.retornoFin || null,
      observacion: input.observacion || null,
      tipoMaterial: input.tipoMaterial || null,
      origen: input.origen || null,
      destino: input.destino || null,
      equipoCarguioId: input.equipoCarguioId || null,
    },
  });

  revalidatePath("/captura/blanca");
  revalidatePath("/dashboard");
}

export async function deleteTrip(tripId: string) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { record: true },
  });
  if (!trip) return;

  const settings = await getOrCreateSettings();
  if (!canEditRecord(session.user, trip.record, settings.dataEntryOpen)) {
    throw new Error("Este registro ya no se puede editar.");
  }

  await prisma.trip.delete({ where: { id: tripId } });
  revalidatePath("/captura/blanca");
  revalidatePath("/dashboard");
}
