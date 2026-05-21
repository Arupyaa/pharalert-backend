import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getMedicationsTableAnalyticsSchema, getPharmaciesTableAnalyticsSchema, getRegionsChartsAnalyticsSchema } from "../validators/analyticsValidator.js";
import { getMedicationsTableAnalyticsService, getPharmaciesTableAnalyticsService, getRegionsChartsAnalyticsService } from "../services/analyticsService.js";

export const getPharmaciesTableAnalytics = catchAsync(async (req, res) => {
    const result = getPharmaciesTableAnalyticsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    let companyId = null;

    if (req.user.accountType === "COMPANY") {
        companyId = req.user.id;
    } else if (req.user.accountType === "ADMIN") {
        companyId = req.query.companyId;
        if (!companyId) {
            throw new AppError("companyId is required for admin users", 400);
        }
    } else {
        throw new AppError("Unauthorized access", 403);
    }

    const data = await getPharmaciesTableAnalyticsService(companyId, result.data);

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

    let companyId = null;

    if (req.user.accountType == "COMPANY") {
        companyId = req.user.id;
    } else if (req.user.accountType == "ADMIN") {
        // Admins can query analytics for any specific company by passing companyId in the query parameters
        companyId = req.query.companyId;
        if (!companyId) {
            throw new AppError("companyId is required for admin users", 400);
        }
    } else {
        throw new AppError("Unauthorized access", 403);
    }

    const data = await getMedicationsTableAnalyticsService(companyId, result.data);

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

    let companyId = null;

    if (req.user.accountType === "COMPANY") {
        companyId = req.user.id;
    } else if (req.user.accountType === "ADMIN") {
        companyId = req.query.companyId;
        if (!companyId) {
            throw new AppError("companyId is required for admin users", 400);
        }
    } else {
        throw new AppError("Unauthorized access", 403);
    }

    const data = await getRegionsChartsAnalyticsService(companyId, result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(data),
    });
});
