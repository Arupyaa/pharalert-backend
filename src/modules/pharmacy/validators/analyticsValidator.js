import { z } from "zod";

const emptyToUndefined = value =>
    value == "" ? undefined : value;

export const analyticsSummarySchema = z.object({
    from: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),

    to: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),
});

export const salesPerformanceSchema = z.object({
    from: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),

    to: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),
});

export const monthlyProfitSchema = z.object({
    year: z.coerce.number().int().min(2000).max(2100)
        .default(new Date().getFullYear()),
});

export const topSellingMedicationsSchema = z.object({
    from: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),

    to: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),

    limit: z.coerce.number().int().min(1).max(20)
        .default(10),
});

export const customerActivitySchema = z.object({
    from: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),

    to: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),
});