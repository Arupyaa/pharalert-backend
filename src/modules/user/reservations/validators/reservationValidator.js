import { z } from "zod";

export const createReservationSchema = z.object({
    items: z
        .array(
            z.object({
                medicationId: z.number().int().positive(),
                quantity: z.number().int().positive(),
            })
        )
        .min(1),
    deliveryDate: z.string().datetime(),
});

export const deleteReservationParamsSchema = z.object({
    id: z.coerce.bigint(),
});

export const getReservationsQuerySchema = z.object({
    status: z.enum(["pending", "delivered"]).optional(),
});
