import { z } from "zod";

export const endUserSchema = z.object({
    userName: z
        .string()
        .min(3)
        .max(300),

    email: z
        .email(),

    password: z
        .string()
        .min(8),

    phoneNumber: z
        .string()
        .min(10)
        .max(20)
        .optional(),

    accountType: z.enum(["paid","free"]),

    address: z
        .string()
        .max(400)
        .optional(),

    latitude: z
        .number()
        .min(-90)
        .max(90)
        .optional(),

    longitude: z
        .number()
        .min(-180)
        .max(180)
        .optional()
});