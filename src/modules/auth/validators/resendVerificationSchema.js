import { z } from "zod";

export const resendVerificationSchema = z.object({
    email: z.string().email(),
    accountType: z.enum(["user", "pharmacy", "company"]),
});
