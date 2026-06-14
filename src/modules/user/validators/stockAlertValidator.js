import { z } from "zod";

export const outOfStockQuerySchema = z.object({
    pharmacyId: z.string().uuid().optional(),
    regionId: z.coerce.bigint().positive().optional(),
}).refine(data => data.pharmacyId || data.regionId, {
    message: "Either pharmacyId or regionId is required",
});

export const subscribeSchema = z.object({
    medicationId: z.number().int().positive(),
    pharmacyId: z.string().uuid().optional(),
    regionId: z.coerce.bigint().positive().optional(),
}).refine(data => data.pharmacyId || data.regionId, {
    message: "Either pharmacyId or regionId is required",
}).refine(data => !(data.pharmacyId && data.regionId), {
    message: "Provide either pharmacyId or regionId, not both",
});

export const deleteAlertParamsSchema = z.object({
    id: z.coerce.bigint().positive(),
});
