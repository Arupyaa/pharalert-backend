import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";

import { analyticsSummarySchema } from "../validators/analyticsValidator.js";
import { getAnalyticsSummaryService } from "../services/analyticsService.js";

import { salesPerformanceSchema, } from "../validators/analyticsValidator.js";
import { getSalesPerformanceService, } from "../services/analyticsService.js";

export const getAnalyticsSummary = catchAsync(
    async (req, res) => {
        const result =
            analyticsSummarySchema.safeParse(req.query);

        if (!result.success) {
            throw new AppError(
                "Validation failed",
                400,
                result.error.flatten()
            );
        }

        const pharmacyId = req.user.id;

        const data =
            await getAnalyticsSummaryService(
                pharmacyId,
                result.data
            );

        res.status(200).json({
            status: "success",
            data,
        });
    }
);

export const getSalesPerformance = catchAsync(
    async (req, res) => {
        const result =
            salesPerformanceSchema.safeParse(
                req.query
            );

        if (!result.success) {
            throw new AppError(
                "Validation failed",
                400,
                result.error.flatten()
            );
        }

        const pharmacyId = req.user.id;

        const data =
            await getSalesPerformanceService(
                pharmacyId,
                result.data
            );

        res.status(200).json({
            status: "success",
            data,
        });
    }
);