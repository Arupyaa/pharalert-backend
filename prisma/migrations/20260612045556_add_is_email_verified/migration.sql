-- AlterTable
ALTER TABLE "EndUser" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MedicationCompany" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Pharmacy" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Set existing records as verified (backward compatibility)
UPDATE "EndUser" SET "isEmailVerified" = true;
UPDATE "MedicationCompany" SET "isEmailVerified" = true;
UPDATE "Pharmacy" SET "isEmailVerified" = true;
