import { z } from "zod";

export const createPurchaseSchema = z.object({
    customerName: z.string().max(255).optional(),

    paymentStatus: z.enum([
        "not_paid",
        "processing_installments",
        "fully_paid"
    ]),

    totalPrice: z.number().positive(),

    items: z.array(
        z.object({
            medicationId: z.number().int().positive(),
            quantity: z.number().int().positive(),
            unitPrice: z.number().positive(),
            medicationDiscount: z.number().min(0).default(0),
            totalPrice: z.number().positive(),
        })
    ).min(1),
});