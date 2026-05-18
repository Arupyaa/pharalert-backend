import { z } from "zod";

const demandSchema = z.object({
    medicationId: z.coerce.number().int().positive(),
    type: z.enum([
        "NO_ACTION",
        "REPLACEMENT_ACCEPTED",
        "REPLACEMENT_REFUSED",
    ]),

    medicationReplacementId: z.coerce.number().int().positive().optional(),
    customerName: z.string().max(255).optional(),
});

export default demandSchema;