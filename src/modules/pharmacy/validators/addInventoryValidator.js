import { z } from "zod";

export const addInventorySchema = z.object({
    medicationId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
});
