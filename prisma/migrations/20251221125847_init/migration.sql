-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "truckNo" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bilti" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "no" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receivedDate" DATETIME,
    "submittedDate" DATETIME,
    "tripId" TEXT NOT NULL,
    CONSTRAINT "Bilti_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartyPaymentDetails" (
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
    "finalPayment" REAL NOT NULL DEFAULT 0,
    "finalPaymentDate" DATETIME,
    "materialTripId" TEXT,
    "truckTripId" TEXT,
    CONSTRAINT "PartyPaymentDetails_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartyPaymentDetails_materialTripId_fkey" FOREIGN KEY ("materialTripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartyPaymentDetails_truckTripId_fkey" FOREIGN KEY ("truckTripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefundDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refundAmount" REAL NOT NULL,
    "refundDate" DATETIME NOT NULL,
    "paymentId" TEXT NOT NULL,
    CONSTRAINT "RefundDetails_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PartyPaymentDetails" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "designation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "altPhone" TEXT,
    "companyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Trip_date_idx" ON "Trip"("date");

-- CreateIndex
CREATE INDEX "Trip_truckNo_idx" ON "Trip"("truckNo");

-- CreateIndex
CREATE UNIQUE INDEX "Bilti_no_key" ON "Bilti"("no");

-- CreateIndex
CREATE UNIQUE INDEX "Bilti_tripId_key" ON "Bilti"("tripId");

-- CreateIndex
CREATE INDEX "Bilti_status_idx" ON "Bilti"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PartyPaymentDetails_materialTripId_key" ON "PartyPaymentDetails"("materialTripId");

-- CreateIndex
CREATE UNIQUE INDEX "PartyPaymentDetails_truckTripId_key" ON "PartyPaymentDetails"("truckTripId");

-- CreateIndex
CREATE INDEX "PartyPaymentDetails_partyId_idx" ON "PartyPaymentDetails"("partyId");

-- CreateIndex
CREATE INDEX "PartyPaymentDetails_paymentStatus_idx" ON "PartyPaymentDetails"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "RefundDetails_paymentId_key" ON "RefundDetails"("paymentId");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_type_idx" ON "Company"("type");

-- CreateIndex
CREATE INDEX "Employee_firstName_idx" ON "Employee"("firstName");

-- CreateIndex
CREATE INDEX "Employee_email_idx" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");
