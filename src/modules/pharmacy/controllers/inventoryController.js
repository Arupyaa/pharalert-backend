import { getInventorySchema } from "../validators/getInventoryValidator.js";
import { getInventoryService } from "../services/inventoryService.js";
import { getInventoryByMedicationIdSchema } from "../validators/getInventoryByMedicationIdValidator.js";
import { getInventoryByMedicationIdService } from "../services/inventoryService.js";

import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js"


export const getInventory = catchAsync(async (req, res) => {
    const result = getInventorySchema.safeParse(req.query);

    if (!result.success) {
        throw new AppError(
            "Validation failed",
            400,
            result.error.flatten()
        );
    }

    const pharmacyId = req.user.id;

    const returnedData = await getInventoryService(
        pharmacyId,
        result.data
    );

    res.status(200).json({
        status: "success",
        ...serializeBigInt(returnedData),
    });
});

export const getInventoryByMedicationId = catchAsync(async (req, res) => {
    const result = getInventoryByMedicationIdSchema.safeParse({
        params: req.params,
    });

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const pharmacyId = req.user.id;
    const medicationId = result.data.params.mid;

    const inventory = await getInventoryByMedicationIdService(
        pharmacyId,
        medicationId
    );

    if (!inventory) {
        throw new AppError("Medication not found in inventory", 404);
    }

    res.status(200).json({
        status: "success",
        ...serializeBigInt(inventory),
    });
});