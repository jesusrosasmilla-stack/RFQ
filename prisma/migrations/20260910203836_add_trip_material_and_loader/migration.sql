-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Trip_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "WhiteLineRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trip_equipoCarguioId_fkey" FOREIGN KEY ("equipoCarguioId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("carguioFin", "carguioInicio", "descargaFin", "descargaInicio", "id", "numero", "observacion", "recordId", "retornoFin") SELECT "carguioFin", "carguioInicio", "descargaFin", "descargaInicio", "id", "numero", "observacion", "recordId", "retornoFin" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
