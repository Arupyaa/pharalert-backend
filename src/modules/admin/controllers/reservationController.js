import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import {
    getReservationsQuerySchema,
    updateReservationStatusBodySchema,
} from "../validators/reservationValidator.js";
import {
    getAllReservationsService,
    updateReservationStatusService,
} from "../services/reservationService.js";

export const getAllReservations = catchAsync(async (req, res) => {
    const result = getReservationsQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const { reservationStatus, page, limit } = result.data;
    const { reservations, totalRecords } = await getAllReservationsService(
        reservationStatus,
        page,
        limit
    );

    res.status(200).json({
        status: "success",
        totalRecords,
        page,
        limit,
        data: serializeBigInt(reservations),
    });
});

export const updateReservationStatus = catchAsync(async (req, res) => {
    const result = updateReservationStatusBodySchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const reservation = await updateReservationStatusService(
        result.data.id,
        result.data.status
    );

    res.status(200).json({
        status: "success",
        data: serializeBigInt(reservation),
    });
});
