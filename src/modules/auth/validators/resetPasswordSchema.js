import { z } from "zod";

export const resetPasswordSchema = z.object({
    email: z.string().email(),
    accountType: z.enum(["user", "pharmacy", "company"]),
    otp: z.string().length(6).regex(/^\d{6}$/),
    newPassword: z.string().min(8),
});
