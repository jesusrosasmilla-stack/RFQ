"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateParam } from "@/lib/date";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Solo el administrador puede realizar esta acción.");
  }
  return session;
}

export async function upsertDailyPlan(input: {
  equipmentId: string;
  date: string;
  metrica: "HM" | "VIAJES";
  valorPlanificado: number;
}) {
  await requireAdmin();
  const date = parseDateParam(input.date);
  await prisma.dailyPlan.upsert({
    where: { equipmentId_date: { equipmentId: input.equipmentId, date } },
    update: { metrica: input.metrica, valorPlanificado: input.valorPlanificado },
    create: {
      equipmentId: input.equipmentId,
      date,
      metrica: input.metrica,
      valorPlanificado: input.valorPlanificado,
    },
  });
  revalidatePath("/admin/planificacion");
  revalidatePath("/dashboard");
}

export async function setCausaNoCumplimiento(planId: string, causa: string, observacion?: string) {
  await requireAdmin();
  await prisma.dailyPlan.update({
    where: { id: planId },
    data: { causaNoCumplimiento: causa, observacion: observacion || null },
  });
  revalidatePath("/admin/planificacion");
  revalidatePath("/dashboard");
}
