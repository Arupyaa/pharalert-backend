import { z } from "zod";

export const getInventorySchema = z.object({
        page: z.coerce.number().int().min(1).default(1),

        limit: z.coerce.number().int().min(1).max(100).default(10),

        search: z.string().trim().optional(),

        categoryId: z.coerce.bigint().optional(),

        stockStatus: z
            .enum(["in_stock", "low_stock", "out_of_stock"])
            .optional(),

        sortBy: z
            .enum(["inventoryValue", "updatedAt"])
            .default("updatedAt"),

        order: z
            .enum(["asc", "desc"])
            .default("asc"),
});