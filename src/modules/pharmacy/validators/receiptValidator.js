import z, { custom } from "zod";

export const receiptSchema = z.object({
    data: z.object({
        pharmacyId: z.string(),
        customerName: z.string().optional(),
        totalPrice: z.string(),
        paymentStatus: z.enum(["fully_paid", "processing_installments", "not_paid"]),

        items: z.array(
            z.object({
                medicationId: z.string(),
                quantity: z.number(),
                unitPrice: z.string(),
                medicationDiscount: z.string().optional(),
                totalPrice: z.string()
            })
        )
    })
});