import { z } from "zod";

export const loginSchema =
    z.object({
        role: z.enum([
            "admin",
            "pharmacy",
            "company",
            "user",
        ]),

        email: z.email(),

        password: z
            .string()
            .min(8),
    });