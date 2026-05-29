import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { updateSettingsSchema } from "../validators/settingsValidator.js";
import {
    getMySettingsService,
    updateMySettingsService,
} from "../services/settingsService.js";

export const getMySettings = catchAsync(async (req, res) => {
    const settings = await getMySettingsService(req.user.id, req.user.accountType);
    res.status(200).json({
        status: "success",
        data: serializeBigInt(settings),
    });
});

export const updateMySettings = catchAsync(async (req, res) => {
    const result = updateSettingsSchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const settings = await updateMySettingsService(
        req.user.id,
        req.user.accountType,
        result.data
    );

    res.status(200).json({
        status: "success",
        message: "Settings updated successfully",
        data: serializeBigInt(settings),
    });
});
