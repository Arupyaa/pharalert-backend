-- AlterTable
CREATE SEQUENCE medicationbarcode_id_seq;
ALTER TABLE "MedicationBarcode" ALTER COLUMN "id" SET DEFAULT nextval('medicationbarcode_id_seq'),
ADD CONSTRAINT "MedicationBarcode_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE medicationbarcode_id_seq OWNED BY "MedicationBarcode"."id";
