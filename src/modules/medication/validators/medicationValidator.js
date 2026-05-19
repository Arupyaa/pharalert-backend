import { z } from "zod";

export const createMedicationSchema = z.object({
    brandName: z.string().trim().min(1).max(255),
    genericName: z.string().trim().min(1).max(255),
    categoryId: z.coerce.bigint().positive(),
    companyId: z.string().uuid(),
    unitPrice: z.number().positive(),
});

export const updateMedicationSchema = z.object({
    brandName: z.string().trim().min(1).max(255).optional(),
    genericName: z.string().trim().min(1).max(255).optional(),
    categoryId: z.coerce.bigint().positive().optional(),
    companyId: z.string().uuid().optional(),
    unitPrice: z.number().positive().optional(),
});

export const getMedicationsSchema = z.object({
    search: z.string().trim().optional(),
    categoryId: z.coerce.bigint().optional(),
    companyId: z.string().uuid().optional(),
});

export const getInStockMedicationsSchema = z.object({
    search: z.string().trim().optional(),
    categoryId: z.coerce.bigint().optional(),
    companyId: z.string().uuid().optional(),
});
