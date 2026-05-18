import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js"
import { analyticsSummarySchema } from "../validators/analyticsValidator.js";
import { getAnalyticsSummaryService } from "../services/analyticsService.js";

import { salesPerformanceSchema, } from "../validators/analyticsValidator.js";
import { getSalesPerformanceService, } from "../services/analyticsService.js";

import { monthlyProfitSchema, topSellingMedicationsSchema, } from "../validators/analyticsValidator.js";

import { getMonthlyProfitService, getTopSellingMedicationsService, } from "../services/analyticsService.js";

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

export const getMonthlyProfit = catchAsync(
    async (req, res) => {
        const result =
            monthlyProfitSchema.safeParse(
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
            await getMonthlyProfitService(
                pharmacyId,
                result.data
            );

        res.status(200).json({
            status: "success",
            data,
        });
    }
);

export const getTopSellingMedications =
    catchAsync(async (req, res) => {
        const result =
            topSellingMedicationsSchema.safeParse(
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
            await getTopSellingMedicationsService(
                pharmacyId,
                result.data
            );

        res.status(200).json({
            status: "success",
            data: serializeBigInt(data),
        });
    });