import { z } from "zod";

export const pharmacySearchSchema = z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    medicationIds: z
        .string()
        .refine((val) => /^\d+(,\d+)*$/.test(val), {
            message: "medicationIds must be a comma-separated list of positive integers",
        }),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    radiusKm: z.coerce.number().positive().default(100),
});
