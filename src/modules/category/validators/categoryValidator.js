import { z } from "zod";

export const createCategorySchema = z.object({
    categoryName: z.string().trim().min(1).max(255),
});
