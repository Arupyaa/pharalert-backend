import { z } from "zod";

export const getInventoryByMedicationIdSchema = z.object({
    params: z.object({
        mid: z.coerce.bigint(),
    }),
});