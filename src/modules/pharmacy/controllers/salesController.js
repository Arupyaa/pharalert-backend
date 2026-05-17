import { medicationSalesSchema } from "../validators/medicationSalesValidator.js";
import { getMedicationSalesService } from "../services/salesService.js";

import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js"

export const getMedicationSales = catchAsync(async (req, res) => {
    const result = medicationSalesSchema.safeParse(req.query);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const pharmacyId = req.user.id;

    const data = await getMedicationSalesService(
        pharmacyId,
        result.data
    );

    res.status(200).json({
        status: "success",
        ...serializeBigInt(data),
    });
});