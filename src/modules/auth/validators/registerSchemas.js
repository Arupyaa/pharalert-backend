import { z } from "zod";

export const registerEndUserSchema =
    z.object({
        userName: z
            .string()
            .min(3)
            .max(300),

        email: z.email(),

        password: z
            .string()
            .min(8),

        phoneNumber: z
            .string()
            .min(10)
            .max(20)
            .optional(),

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
            .optional(),
    });

export const registerPharmacySchema =
    z.object({
        name: z
            .string()
            .min(2)
            .max(255),

        email: z.email(),

        password: z
            .string()
            .min(8),

        address: z
            .string()
            .min(5),

        latitude: z
            .number()
            .min(-90)
            .max(90),

        longitude: z
            .number()
            .min(-180)
            .max(180),

        regionId: z.coerce.bigint(),

        documentImageUrl:
            z.url(),
    });

export const registerCompanySchema =
    z.object({
        companyName: z
            .string()
            .min(2)
            .max(255),

        email: z.email(),

        password: z
            .string()
            .min(8),

        phoneNumber: z
            .string()
            .min(10)
            .max(20)
            .optional(),

        documentImageUrl:
            z.url(),
    });