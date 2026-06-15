import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getCategoriesService, createCategoryService } from "../services/categoryService.js";
import { createCategorySchema } from "../validators/categoryValidator.js";

export const getCategories = catchAsync(async (req, res) => {
    const categories = await getCategoriesService();
    res.status(200).json({
        status: "success",
        data: serializeBigInt(categories),
    });
});

export const createCategory = catchAsync(async (req, res) => {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }
    const category = await createCategoryService(result.data.categoryName);
    res.status(201).json({
        status: "success",
        data: serializeBigInt(category),
    });
});
