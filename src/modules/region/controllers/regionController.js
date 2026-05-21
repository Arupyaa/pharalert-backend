import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getRegionsService } from "../services/regionService.js";

export const getRegions = catchAsync(async (req, res) => {
    const regions = await getRegionsService();
    res.status(200).json({
        status: "success",
        data: serializeBigInt(regions),
    });
});
