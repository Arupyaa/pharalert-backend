import { z } from "zod";

export const purchaseSubscriptionSchema = z.object({
    paymentMethod: z.string().min(1).max(50),
});
