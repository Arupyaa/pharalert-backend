import { z } from "zod";

const emptyToUndefined = value =>
    value === "" ? undefined : value;

export const getMedicationsQuerySchema = z.object({
    search: z.preprocess(
        emptyToUndefined,
        z.string().optional()
    ),
    region: z.preprocess(
        emptyToUndefined,
        z.string().optional()
    ),
    page: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().min(1).max(100).default(10)
    ),
});
