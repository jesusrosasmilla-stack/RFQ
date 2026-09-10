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
    { code: "CF038", name: "Cargador frontal Volvo EC380 / CF038", contratista: "EMICONSATH", costoHm: 80.02 },
    { code: "CF012", name: "Cargador frontal CAT962 / CAR12", contratista: "EMICONSATH", costoHm: 80.02 },
    { code: "EXC026", name: "Excavadora CAT330 / EMI26", contratista: "EMICONSATH", costoHm: 108.62 },
    { code: "EXC027", name: "Excavadora CAT330 / EMI27", contratista: "EMICONSATH", costoHm: 108.62 },
    { code: "EXC029", name: "Excavadora CAT336D2L / EMI29", contratista: "EMICONSATH", costoHm: 113.5 },
    { code: "EXC034", name: "Excavadora CAT330 / EMI34", contratista: "EMICONSATH", costoHm: 108.62 },
    { code: "EXC038", name: "Excavadora Volvo EC380E / EMI38", contratista: "EMICONSATH", costoHm: 113.5 },
    { code: "EXC044", name: "Excavadora CAT336 / EMI EXC 44", contratista: "EMICONSATH", costoHm: 113.5 },
    { code: "TRC044", name: "Tractor Sobreoruga / TRC-44", contratista: "EMICONSATH", costoHm: 131.66 },
    { code: "TRC049", name: "Tractor Sobreoruga / TRC-49", contratista: "EMICONSATH", costoHm: 131.66 },
    { code: "RET010", name: "Retroexcavadora CAT 420 / EMI 10", contratista: "EMICONSATH", costoHm: 51.41 },
    { code: "EXC046", name: "Excavadora Volvo EC350E / EMI46", contratista: "EMICONSATH", costoHm: 113.5 },
    { code: "EXC047", name: "Excavadora Volvo EC380E / EMI347", contratista: "EMICONSATH", costoHm: 113.5 },
  ];
  for (const eq of yellow) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: eq,
      create: { ...eq, category: "LINEA_AMARILLA" },
    });
  }

  const CONTRATISTA_BLANCA = "SAN JUAN HUAYLLAY";
  const white = [
    { code: "VOL-09", name: "Volquete 09", placa: "BMV940", volumen: 20, costoHm: 68.8 },
    { code: "VOL-10", name: "Volquete 10", placa: "BMV174", volumen: 20, costoHm: 68.8 },
    { code: "VOL-11", name: "Volquete 11", placa: "BJJ900", volumen: 20, costoHm: 68.8 },
    { code: "VOL-13", name: "Volquete 13", placa: "AXH798", volumen: 15, costoHm: 66.8 },
    { code: "VOL-15", name: "Volquete 15", placa: "AZN708", volumen: 15, costoHm: 66.8 },
    { code: "VOL-16", name: "Volquete 16", placa: "BBH884", volumen: 15, costoHm: 66.8 },
    { code: "VOL-17", name: "Volquete 17", placa: "AZR734", volumen: 15, costoHm: 66.8 },
    { code: "VOL-19", name: "Volquete 19", placa: "BKR939", volumen: 15, costoHm: 66.8 },
    { code: "VOL-24", name: "Volquete 24", placa: "BVA734", volumen: 20, costoHm: 68.8 },
    { code: "VOL-27", name: "Volquete 27", placa: "BUO855", volumen: 20, costoHm: 68.8 },
    { code: "VOL-31", name: "Volquete 31", placa: "BJR855", volumen: 15, costoHm: 66.8 },
    { code: "VOL-33", name: "Volquete 33", placa: "AWH714", volumen: 20, costoHm: 68.8 },
    { code: "VOL-34", name: "Volquete 34", placa: "BMV816", volumen: 15, costoHm: 66.8 },
    { code: "VOL-35", name: "Volquete 35", placa: "BFX747", volumen: 15, costoHm: 66.8 },
    { code: "VOL-37", name: "Volquete 37", placa: "CEA753", volumen: 15, costoHm: 66.8 },
    { code: "VOL-38", name: "Volquete 38", placa: "CEA876", volumen: 15, costoHm: 66.8 },
    { code: "VOL-39", name: "Volquete 39", placa: "T0Z930", volumen: 20, costoHm: 68.8 },
    { code: "VOL-40", name: "Volquete 40", placa: "BCH816", volumen: 15, costoHm: 66.8 },
    { code: "VOL-41", name: "Volquete 41", placa: "CEG800", volumen: 15, costoHm: 66.8 },
    { code: "VOL-43", name: "Volquete 43", placa: "CEV762", volumen: 15, costoHm: 66.8 },
    { code: "VOL-44", name: "Volquete 44", placa: "CEX734", volumen: 15, costoHm: 66.8 },
    { code: "VOL-45", name: "Volquete 45", placa: "CEX874", volumen: 15, costoHm: 66.8 },
    { code: "VOL-46", name: "Volquete 46", placa: "CEW709", volumen: 15, costoHm: 66.8 },
    { code: "VOL-47", name: "Volquete 47", placa: "BNH794", volumen: 15, costoHm: 66.8 },
    { code: "VOL-48", name: "Volquete 48", placa: "CLX806", volumen: 15, costoHm: 66.8 },
    { code: "VOL-49", name: "Volquete 49", placa: "CEM717", volumen: 15, costoHm: 66.8 },
    { code: "VOL-50", name: "Volquete 50", placa: "CMF719", volumen: 15, costoHm: 66.8 },
    { code: "CIST-01", name: "Cisterna de Agua", placa: "BLA806", volumen: 15, costoHm: 50.84 },
    { code: "CIST-02", name: "Cisterna de Agua", placa: "BKM732", volumen: 15, costoHm: 50.84 },
    { code: "CIST-03", name: "Cisterna de Agua", placa: "BTH914", volumen: 15, costoHm: 50.84 },
  ].map((eq) => ({ ...eq, contratista: CONTRATISTA_BLANCA }));
  for (const eq of white) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: eq,
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
