import {
    createReservationSchema,
    deleteReservationParamsSchema,
    getReservationsQuerySchema,
} from "../validators/reservationValidator.js";
import {
    createReservationService,
    deleteReservationService,
    getUserReservationsService,
} from "../services/reservationService.js";
import { serializeBigInt } from "../../../../utils/serializeBigInt.js";
import catchAsync from "../../../../utils/catchAsync.js";
import AppError from "../../../../utils/AppError.js";

export const createReservation = catchAsync(async (req, res) => {
    const result = createReservationSchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }
    const reservation = await createReservationService(req.user.id, result.data);
    res.status(201).json({
        status: "success",
        data: serializeBigInt(reservation),
    });
});

export const getUserReservations = catchAsync(async (req, res) => {
    const result = getReservationsQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }
    const reservations = await getUserReservationsService(req.user.id, result.data);
    res.status(200).json({
        status: "success",
        data: serializeBigInt(reservations),
    });
});

export const deleteReservation = catchAsync(async (req, res) => {
    const result = deleteReservationParamsSchema.safeParse({ id: req.params.id });
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }
    await deleteReservationService(req.user.id, result.data.id);
    res.status(200).json({
        status: "success",
        message: "Reservation deleted successfully",
    });
});
