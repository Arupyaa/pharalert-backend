import { z } from "zod";

const emptyToUndefined = value =>
    value == "" ? undefined : value;

export const getMedicationsTableAnalyticsSchema = z.object({
    regionId: z.coerce.bigint({
        invalid_type_error: "regionId must be a BigInt",
        required_error: "regionId is required",
    }),
    categoryId: z.coerce.bigint().optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    from: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),
    to: z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    ),
});
