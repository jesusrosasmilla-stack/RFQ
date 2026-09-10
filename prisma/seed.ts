import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Administrador",
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
      active: true,
    },
  });

  const opPassword = process.env.SEED_OPERATOR_PASSWORD || "Operador123!";
  const opHash = await bcrypt.hash(opPassword, 10);
  await prisma.user.upsert({
    where: { username: "operador1" },
    update: {},
    create: {
      name: "Operador de Campo",
      username: "operador1",
      passwordHash: opHash,
      role: "OPERATOR",
      active: false,
    },
  });

  const yellow = [
    { code: "EXC-01", name: "Excavadora CAT 320", model: "CAT 320" },
    { code: "EXC-02", name: "Excavadora Komatsu PC200", model: "Komatsu PC200" },
    { code: "RET-01", name: "Retroexcavadora CAT 420", model: "CAT 420" },
    { code: "MOT-01", name: "Motoniveladora CAT 140K", model: "CAT 140K" },
  ];
  for (const eq of yellow) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: {},
      create: { ...eq, category: "LINEA_AMARILLA" },
    });
  }

  const white = [
    { code: "VOL-01", name: "Volquete 01", model: "Volvo FMX" },
    { code: "VOL-02", name: "Volquete 02", model: "Volvo FMX" },
    { code: "VOL-03", name: "Volquete 03", model: "Mercedes Actros" },
  ];
  for (const eq of white) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: {},
      create: { ...eq, category: "LINEA_BLANCA" },
    });
  }

  console.log("Seed completo.");
  console.log(`Usuario admin: admin / ${adminPassword}`);
  console.log(`Usuario operador: operador1 / ${opPassword} (inactivo hasta que el admin le dé acceso)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
