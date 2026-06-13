import { z } from "zod";

export const createOrderSchema = z.object({
    supplierName: z.string().min(1).max(255),
    items: z
        .array(
            z.object({
                medicationId: z.number().int().positive(),
                quantity: z.number().int().positive(),
            })
        )
        .min(1),
    paymentMethod: z.string().min(1).max(50),
    notes: z.string().optional(),
});
