/*
  Warnings:

  - Added the required column `documentImageUrl` to the `MedicationCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentImageUrl` to the `Pharmacy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedicationCompany" ADD COLUMN     "documentImageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pharmacy" ADD COLUMN     "documentImageUrl" TEXT NOT NULL;
