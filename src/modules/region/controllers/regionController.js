import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getRegionsService, createRegionService } from "../services/regionService.js";
import { createRegionSchema } from "../validators/regionValidator.js";

export const getRegions = catchAsync(async (req, res) => {
    const regions = await getRegionsService();
    res.status(200).json({
        status: "success",
        data: serializeBigInt(regions),
    });
});

export const createRegion = catchAsync(async (req, res) => {
    const result = createRegionSchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }
    const region = await createRegionService(result.data.name);
    res.status(201).json({
        status: "success",
        data: serializeBigInt(region),
    });
});
