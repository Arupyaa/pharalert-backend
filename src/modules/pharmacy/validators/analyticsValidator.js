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