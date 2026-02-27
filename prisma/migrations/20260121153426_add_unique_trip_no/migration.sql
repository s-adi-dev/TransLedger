/*
  Warnings:

  - Made the column `tripNo` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripNo" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "truckNo" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Trip" ("createdAt", "date", "from", "id", "remarks", "to", "tripNo", "truckNo", "updatedAt", "weight") SELECT "createdAt", "date", "from", "id", "remarks", "to", "tripNo", "truckNo", "updatedAt", "weight" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE UNIQUE INDEX "Trip_tripNo_key" ON "Trip"("tripNo");
CREATE INDEX "Trip_date_idx" ON "Trip"("date");
CREATE INDEX "Trip_truckNo_idx" ON "Trip"("truckNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
