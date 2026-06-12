import {
    outOfStockQuerySchema,
    subscribeSchema,
    deleteAlertParamsSchema,
} from "../validators/stockAlertValidator.js";
import {
    getOutOfStockService,
    subscribeAlertService,
    unsubscribeAlertService,
    getUserAlertsService,
} from "../services/stockAlertService.js";

import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";

export const getOutOfStock = catchAsync(async (req, res) => {
    const result = outOfStockQuerySchema.safeParse(req.query);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getOutOfStockService(
        result.data.pharmacyId,
        result.data.regionId
    );

    res.status(200).json({ status: "success", data });
});

export const subscribe = catchAsync(async (req, res) => {
    const result = subscribeSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const alert = await subscribeAlertService(
        req.user.id,
        result.data.medicationId,
        result.data.pharmacyId,
        result.data.regionId
    );

    res.status(201).json({
        status: "success",
        data: serializeBigInt(alert),
    });
});

export const unsubscribe = catchAsync(async (req, res) => {
    const result = deleteAlertParamsSchema.safeParse(req.params);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await unsubscribeAlertService(result.data.id, req.user.id);

    res.status(200).json({
        status: "success",
        message: "Alert deleted successfully",
    });
});

export const getAlerts = catchAsync(async (req, res) => {
    const alerts = await getUserAlertsService(req.user.id);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(alerts),
    });
});
