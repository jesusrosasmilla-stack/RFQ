"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertCanWrite } from "@/lib/access";
import { parseDateParam } from "@/lib/date";
import { saveUploadedImage } from "@/lib/uploads";

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("No autenticado.");
  return session;
}

function revalidateCapture() {
  revalidatePath("/captura/amarilla");
  revalidatePath("/captura/blanca");
  revalidatePath("/dashboard");
}

export async function addToRoster(input: {
  equipmentId: string;
  date: string;
  estado: "TRABAJANDO" | "INOPERATIVO";
  motivo?: string;
}) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  const date = parseDateParam(input.date);
  await prisma.dailyRoster.upsert({
    where: { equipmentId_date: { equipmentId: input.equipmentId, date } },
    update: { estado: input.estado, motivo: input.motivo || null },
    create: {
      equipmentId: input.equipmentId,
      date,
      estado: input.estado,
      motivo: input.motivo || null,
      createdById: session.user.id,
    },
  });
  revalidateCapture();
}

export async function setRosterEstado(
  rosterId: string,
  estado: "TRABAJANDO" | "INOPERATIVO",
  motivo?: string
) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  await prisma.dailyRoster.update({
    where: { id: rosterId },
    data: { estado, motivo: motivo || null },
  });
  revalidateCapture();
}

export async function uploadRosterFoto(rosterId: string, field: "inicio" | "fin", file: File) {
  const session = await requireSession();
  await assertCanWrite(session.user);

  const url = await saveUploadedImage(file, "roster");
  await prisma.dailyRoster.update({
    where: { id: rosterId },
    data: field === "inicio" ? { fotoInicioUrl: url } : { fotoFinUrl: url },
  });
  revalidateCapture();
  return url;
}
