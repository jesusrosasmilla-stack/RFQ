-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('LINEA_AMARILLA', 'LINEA_BLANCA');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('FALLA_MECANICA', 'MANTENIMIENTO', 'CLIMA', 'FALTA_OPERADOR', 'FALTA_MATERIAL', 'OTRO');

-- CreateEnum
CREATE TYPE "RosterEstado" AS ENUM ('TRABAJANDO', 'INOPERATIVO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "model" TEXT,
    "placa" TEXT,
    "costoHm" DOUBLE PRECISION,
    "contratista" TEXT,
    "volumen" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRoster" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "estado" "RosterEstado" NOT NULL DEFAULT 'TRABAJANDO',
    "motivo" TEXT,
    "fotoInicioUrl" TEXT,
    "fotoFinUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "workStart" TEXT NOT NULL DEFAULT '07:00',
    "workEnd" TEXT NOT NULL DEFAULT '18:00',
    "lunchStart" TEXT NOT NULL DEFAULT '12:00',
    "lunchEnd" TEXT NOT NULL DEFAULT '13:00',
    "dataEntryOpen" BOOLEAN NOT NULL DEFAULT false,
    "dataEntryOpenedAt" TIMESTAMP(3),
    "dataEntryOpenedBy" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YellowLineRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "horometroInicial" DOUBLE PRECISION NOT NULL,
    "horometroFinal" DOUBLE PRECISION,
    "fotoHorometroInicialUrl" TEXT,
    "fotoHorometroFinalUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YellowLineRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YellowLineStop" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "tipo" "StopType" NOT NULL DEFAULT 'FALLA_MECANICA',
    "observacion" TEXT,

    CONSTRAINT "YellowLineStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteLineRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteLineRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "carguioInicio" TEXT NOT NULL,
    "carguioFin" TEXT NOT NULL,
    "descargaInicio" TEXT NOT NULL,
    "descargaFin" TEXT NOT NULL,
    "retornoFin" TEXT,
    "observacion" TEXT,
    "tipoMaterial" TEXT,
    "origen" TEXT,
    "destino" TEXT,
    "equipoCarguioId" TEXT,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "metrica" TEXT NOT NULL,
    "valorPlanificado" DOUBLE PRECISION NOT NULL,
    "causaNoCumplimiento" TEXT,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "byAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_code_key" ON "Equipment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRoster_equipmentId_date_key" ON "DailyRoster"("equipmentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "YellowLineRecord_equipmentId_date_key" ON "YellowLineRecord"("equipmentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLineRecord_equipmentId_date_key" ON "WhiteLineRecord"("equipmentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_equipmentId_date_key" ON "DailyPlan"("equipmentId", "date");

-- AddForeignKey
ALTER TABLE "DailyRoster" ADD CONSTRAINT "DailyRoster_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRoster" ADD CONSTRAINT "DailyRoster_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YellowLineRecord" ADD CONSTRAINT "YellowLineRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YellowLineRecord" ADD CONSTRAINT "YellowLineRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YellowLineStop" ADD CONSTRAINT "YellowLineStop_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "YellowLineRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLineRecord" ADD CONSTRAINT "WhiteLineRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLineRecord" ADD CONSTRAINT "WhiteLineRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "WhiteLineRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_equipoCarguioId_fkey" FOREIGN KEY ("equipoCarguioId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
