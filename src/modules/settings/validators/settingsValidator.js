import { z } from "zod";

export const updateSettingsSchema = z.object({
    userName: z.string().min(3).max(300).optional(),
    name: z.string().min(2).max(255).optional(),
    companyName: z.string().min(2).max(255).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().min(10).max(20).optional(),
    address: z.string().min(5).max(400).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    openingHour: z.string().optional(),
    closingHour: z.string().optional(),
    documentImageUrl: z.string().url().optional(),
    regionId: z.coerce.bigint().positive().optional(),
}).superRefine((data, ctx) => {
    const forbidden = ["password", "passwordHash"];
    for (const key of Object.keys(data)) {
        if (forbidden.includes(key)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password changes are not allowed through this endpoint",
                path: [key],
            });
        }
    }
});
