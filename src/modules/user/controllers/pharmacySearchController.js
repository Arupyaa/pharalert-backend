import { pharmacySearchSchema } from "../validators/pharmacySearchSchema.js";
import { listPharmaciesService, searchPharmaciesService } from "../services/pharmacySearchService.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";

export const listPharmacies = catchAsync(async (req, res) => {
    const data = await listPharmaciesService();
    res.status(200).json({ status: "success", data });
});

export const searchPharmacies = catchAsync(async (req, res) => {
    const result = pharmacySearchSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }
    const { medicationIds, ...rest } = result.data;
    const data = await searchPharmaciesService({
        ...rest,
        medicationIds: medicationIds.split(",").map((id) => BigInt(id.trim())),
    });
    res.status(200).json({
        status: "success",
        ...serializeBigInt(data),
    });
});
