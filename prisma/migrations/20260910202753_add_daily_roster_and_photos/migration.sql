-- AlterTable
ALTER TABLE "YellowLineRecord" ADD COLUMN "fotoHorometroFinalUrl" TEXT;
ALTER TABLE "YellowLineRecord" ADD COLUMN "fotoHorometroInicialUrl" TEXT;

-- CreateTable
CREATE TABLE "DailyRoster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'TRABAJANDO',
    "motivo" TEXT,
    "fotoInicioUrl" TEXT,
    "fotoFinUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyRoster_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyRoster_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRoster_equipmentId_date_key" ON "DailyRoster"("equipmentId", "date");
