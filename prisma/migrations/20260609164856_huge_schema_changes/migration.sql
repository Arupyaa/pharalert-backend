-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('VERIFY_EMAIL', 'FORGOT_PASSWORD', 'CHANGE_PASSWORD');

-- DropForeignKey
ALTER TABLE "Medication" DROP CONSTRAINT "Medication_companyId_fkey";

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "manufacturingCompany" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StockAlertSubscription" ADD COLUMN     "pharmacyId" TEXT,
ADD COLUMN     "regionId" BIGINT;

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OTPType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySuggestedMedication" (
    "id" BIGSERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanySuggestedMedication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OTP_email_idx" ON "OTP"("email");

-- CreateIndex
CREATE INDEX "CompanySuggestedMedication_companyId_idx" ON "CompanySuggestedMedication"("companyId");

-- CreateIndex
CREATE INDEX "CompanySuggestedMedication_medicationId_idx" ON "CompanySuggestedMedication"("medicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySuggestedMedication_companyId_medicationId_key" ON "CompanySuggestedMedication"("companyId", "medicationId");

-- CreateIndex
CREATE INDEX "StockAlertSubscription_regionId_idx" ON "StockAlertSubscription"("regionId");

-- CreateIndex
CREATE INDEX "StockAlertSubscription_pharmacyId_idx" ON "StockAlertSubscription"("pharmacyId");

-- AddForeignKey
ALTER TABLE "CompanySuggestedMedication" ADD CONSTRAINT "CompanySuggestedMedication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "MedicationCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySuggestedMedication" ADD CONSTRAINT "CompanySuggestedMedication_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "MedicationCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSubscription" ADD CONSTRAINT "StockAlertSubscription_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSubscription" ADD CONSTRAINT "StockAlertSubscription_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
