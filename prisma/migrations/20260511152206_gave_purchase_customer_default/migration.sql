/*
  Warnings:

  - Made the column `customerName` on table `Purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "customerName" SET NOT NULL,
ALTER COLUMN "customerName" SET DEFAULT 'customer';
