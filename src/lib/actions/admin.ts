"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateSettings } from "@/lib/access";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Solo el administrador puede realizar esta acción.");
  }
  return session;
}

export async function setDataEntryOpen(open: boolean) {
  const session = await requireAdmin();
  await getOrCreateSettings();
  await prisma.settings.update({
    where: { id: 1 },
    data: {
      dataEntryOpen: open,
      dataEntryOpenedAt: open ? new Date() : null,
      dataEntryOpenedBy: open ? session.user.name : null,
    },
  });
  revalidatePath("/", "layout");
}

export async function updateWorkdayConfig(data: {
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}) {
  await requireAdmin();
  await getOrCreateSettings();
  await prisma.settings.update({ where: { id: 1 }, data });
  revalidatePath("/", "layout");
}

export async function createOperator(data: { name: string; username: string; password: string }) {
  await requireAdmin();
  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      passwordHash,
      role: "OPERATOR",
      active: false,
    },
  });
  revalidatePath("/admin/usuarios");
}

export async function setUserActive(userId: string, active: boolean) {
  const session = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { active } });
  await prisma.accessLog.create({
    data: {
      userId,
      action: active ? "GRANTED" : "REVOKED",
      byAdmin: session.user.name,
    },
  });
  revalidatePath("/admin/usuarios");
}

export async function resetOperatorPassword(userId: string, password: string) {
  await requireAdmin();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  revalidatePath("/admin/usuarios");
}

export async function createEquipment(data: {
  code: string;
  name: string;
  model?: string;
  category: "LINEA_AMARILLA" | "LINEA_BLANCA";
}) {
  await requireAdmin();
  await prisma.equipment.create({ data });
  revalidatePath("/admin/equipos");
}

export async function setEquipmentActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.equipment.update({ where: { id }, data: { active } });
  revalidatePath("/admin/equipos");
}

export async function setRecordLocked(
  kind: "yellow" | "white",
  id: string,
  locked: boolean
) {
  await requireAdmin();
  if (kind === "yellow") {
    await prisma.yellowLineRecord.update({ where: { id }, data: { locked } });
  } else {
    await prisma.whiteLineRecord.update({ where: { id }, data: { locked } });
  }
  revalidatePath("/admin/registros");
}

export async function deleteRecord(kind: "yellow" | "white", id: string) {
  await requireAdmin();
  if (kind === "yellow") {
    await prisma.yellowLineRecord.delete({ where: { id } });
  } else {
    await prisma.whiteLineRecord.delete({ where: { id } });
  }
  revalidatePath("/admin/registros");
}
