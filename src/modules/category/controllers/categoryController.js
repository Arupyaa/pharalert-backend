import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getCategoriesService } from "../services/categoryService.js";

export const getCategories = catchAsync(async (req, res) => {
    const categories = await getCategoriesService();
    res.status(200).json({
        status: "success",
        data: serializeBigInt(categories),
    });
});
