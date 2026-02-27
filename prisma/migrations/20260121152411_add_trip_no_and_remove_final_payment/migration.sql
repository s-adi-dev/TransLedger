/*
  Warnings:

  - You are about to drop the column `finalPayment` on the `PartyPaymentDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "tripNo" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartyPaymentDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partyId" TEXT NOT NULL,
    "freightAmount" REAL NOT NULL DEFAULT 0,
    "advanceAmount" REAL NOT NULL DEFAULT 0,
    "advanceDate" DATETIME,
    "loadingCharge" REAL NOT NULL DEFAULT 0,
    "unloadingCharge" REAL NOT NULL DEFAULT 0,
    "damageCharge" REAL NOT NULL DEFAULT 0,
    "tdsAmount" REAL NOT NULL DEFAULT 0,
    "commissionAmount" REAL NOT NULL DEFAULT 0,
    "extraChargesAmount" REAL NOT NULL DEFAULT 0,
    "extraChargesType" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "finalPaymentDate" DATETIME,
    "materialTripId" TEXT,
    "truckTripId" TEXT,
    CONSTRAINT "PartyPaymentDetails_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartyPaymentDetails_materialTripId_fkey" FOREIGN KEY ("materialTripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartyPaymentDetails_truckTripId_fkey" FOREIGN KEY ("truckTripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PartyPaymentDetails" ("advanceAmount", "advanceDate", "commissionAmount", "damageCharge", "extraChargesAmount", "extraChargesType", "finalPaymentDate", "freightAmount", "id", "loadingCharge", "materialTripId", "partyId", "paymentStatus", "tdsAmount", "truckTripId", "unloadingCharge") SELECT "advanceAmount", "advanceDate", "commissionAmount", "damageCharge", "extraChargesAmount", "extraChargesType", "finalPaymentDate", "freightAmount", "id", "loadingCharge", "materialTripId", "partyId", "paymentStatus", "tdsAmount", "truckTripId", "unloadingCharge" FROM "PartyPaymentDetails";
DROP TABLE "PartyPaymentDetails";
ALTER TABLE "new_PartyPaymentDetails" RENAME TO "PartyPaymentDetails";
CREATE UNIQUE INDEX "PartyPaymentDetails_materialTripId_key" ON "PartyPaymentDetails"("materialTripId");
CREATE UNIQUE INDEX "PartyPaymentDetails_truckTripId_key" ON "PartyPaymentDetails"("truckTripId");
CREATE INDEX "PartyPaymentDetails_partyId_idx" ON "PartyPaymentDetails"("partyId");
CREATE INDEX "PartyPaymentDetails_paymentStatus_idx" ON "PartyPaymentDetails"("paymentStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
