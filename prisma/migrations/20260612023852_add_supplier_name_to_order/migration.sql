/*
  Warnings:

  - Added the required column `supplierName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_supplierCompanyId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "supplierName" TEXT NOT NULL,
ALTER COLUMN "supplierCompanyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierCompanyId_fkey" FOREIGN KEY ("supplierCompanyId") REFERENCES "MedicationCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
