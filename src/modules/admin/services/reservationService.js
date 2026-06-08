import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

export async function getAllReservationsService(reservationStatus, page, limit) {
    const skip = (page - 1) * limit;
    const where = {};

    if (reservationStatus) {
        where.status = reservationStatus;
    }

    const [reservations, totalRecords] = await Promise.all([
        prisma.reservation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                items: {
                    include: {
                        medication: {
                            select: {
                                id: true,
                                brandName: true,
                                genericName: true,
                                unitPrice: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.reservation.count({ where }),
    ]);

    return { reservations, totalRecords };
}

export async function updateReservationStatusService(id, status) {
    const existing = await prisma.reservation.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Reservation not found", 404);
    }

    const updated = await prisma.reservation.update({
        where: { id },
        data: { status },
        include: {
            user: {
                select: {
                    id: true,
                    userName: true,
                    email: true,
                },
            },
            items: {
                include: {
                    medication: {
                        select: {
                            id: true,
                            brandName: true,
                            genericName: true,
                        },
                    },
                },
            },
        },
    });

    return updated;
}
