import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getMedicationsTableAnalyticsSchema, getPharmaciesTableAnalyticsSchema, getRegionsChartsAnalyticsSchema, getMedicationsChartsAnalyticsSchema, getPharmaciesChartsAnalyticsSchema, getDemandChartsAnalyticsSchema, getSummaryAnalyticsSchema } from "../validators/analyticsValidator.js";
import { getMedicationsTableAnalyticsService, getPharmaciesTableAnalyticsService, getRegionsChartsAnalyticsService, getMedicationsChartsAnalyticsService, getPharmaciesChartsAnalyticsService, getDemandChartsAnalyticsService, getSummaryAnalyticsService } from "../services/analyticsService.js";

export const getPharmaciesTableAnalytics = catchAsync(async (req, res) => {
    const result = getPharmaciesTableAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getPharmaciesTableAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        ...serializeBigInt(data),
    });
});

export const getMedicationsTableAnalytics = catchAsync(async (req, res) => {
    const result = getMedicationsTableAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getMedicationsTableAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        ...serializeBigInt(data),
    });
});

export const getRegionsChartsAnalytics = catchAsync(async (req, res) => {
    const result = getRegionsChartsAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getRegionsChartsAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(data),
    });
});

export const getMedicationsChartsAnalytics = catchAsync(async (req, res) => {
    const result = getMedicationsChartsAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getMedicationsChartsAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(data),
    });
});

export const getPharmaciesChartsAnalytics = catchAsync(async (req, res) => {
    const result = getPharmaciesChartsAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getPharmaciesChartsAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(data),
    });
});

export const getDemandChartsAnalytics = catchAsync(async (req, res) => {
    const result = getDemandChartsAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getDemandChartsAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(data),
    });
});

export const getSummaryAnalytics = catchAsync(async (req, res) => {
    const result = getSummaryAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const data = await getSummaryAnalyticsService(result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(data),
    });
});
