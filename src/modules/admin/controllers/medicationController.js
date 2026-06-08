import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getMedicationsQuerySchema } from "../validators/medicationValidator.js";
import { getAllMedicationsService } from "../services/medicationService.js";

export const getAllMedications = catchAsync(async (req, res) => {
    const result = getMedicationsQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const { search, region, page, limit } = result.data;
    const { inventory, totalRecords } = await getAllMedicationsService(
        search,
        region,
        page,
        limit
    );

    res.status(200).json({
        status: "success",
        totalRecords,
        page,
        limit,
        data: serializeBigInt(inventory),
    });
});
