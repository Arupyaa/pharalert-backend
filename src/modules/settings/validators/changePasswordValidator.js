import { z } from "zod";

export const requestOtpSchema = z.object({
    currentPassword: z.string().min(1),
});

export const confirmChangePasswordSchema = z.object({
    otp: z.string().length(6).regex(/^\d{6}$/),
    newPassword: z.string().min(8),
});
