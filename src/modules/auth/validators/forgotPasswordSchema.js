import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
    accountType: z.enum(["user", "pharmacy", "company"]),
});
