import { z } from "zod";

export const createBarcodeSchema = z.object({
    barcode: z.string().trim().min(1).max(255),
    medicationId: z.coerce.bigint().positive(),
});
