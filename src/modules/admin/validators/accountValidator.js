import { z } from "zod";

const emptyToUndefined = value =>
    value === "" ? undefined : value;

export const getAccountsQuerySchema = z.object({
    accountType: z.enum(["ADMIN", "PHARMACY", "COMPANY", "FREE_USER", "PAID_USER"]).optional(),
    accountStatus: z.enum(["pending", "rejected", "active", "inactive"]).optional(),
    page: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().min(1).default(1)
    ),
    limit: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().min(1).max(100).default(10)
    ),
});

export const changeAccountStatusParamsSchema = z.object({
    id: z.string().uuid(),
});

export const changeAccountStatusBodySchema = z.object({
    accountStatus: z.enum(["pending", "rejected", "active", "inactive"]),
});

export const changeUserTypeParamsSchema = z.object({
    id: z.string().uuid(),
});

export const changeUserTypeBodySchema = z.object({
    userType: z.enum(["free", "paid"]),
});

export const companyIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const updateSuggestedMedicationsBodySchema = z.object({
    suggestedMedicationIds: z.array(z.coerce.bigint().positive()),
});
