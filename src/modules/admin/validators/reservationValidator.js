import { z } from "zod";

const emptyToUndefined = value =>
    value === "" ? undefined : value;

export const getReservationsQuerySchema = z.object({
    reservationStatus: z.enum(["pending", "delivered"]).optional(),
    page: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().min(1).max(100).default(10)
    ),
});

export const updateReservationStatusBodySchema = z.object({
    id: z.coerce.bigint(),
    status: z.enum(["pending", "delivered"]),
});
