import { z } from "zod";

export const getPurchasesSchema = z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
        medicationId: z.coerce.number().optional(),
        order: z.enum(["asc", "desc"]).optional(),
});