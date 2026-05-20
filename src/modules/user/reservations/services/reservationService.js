import prisma from "../../../../prisma.js";
import AppError from "../../../../utils/AppError.js";

export async function createReservationService(userId, data) {
    const { items, deliveryDate } = data;
    const medicationIds = items.map((item) => item.medicationId);

    const stockAggregation = await prisma.pharmacyInventory.groupBy({
        by: ["medicationId"],
        where: {
            medicationId: { in: medicationIds },
            pharmacy: { accountStatus: "active" },
        },
        _sum: { stock: true },
    });

    const stockMap = {};
    for (const entry of stockAggregation) {
        stockMap[entry.medicationId.toString()] = Number(entry._sum.stock);
    }

    for (const item of items) {
        const totalStock = stockMap[item.medicationId] || 0;
        if (totalStock <= 0) {
            throw new AppError(`Medication ${item.medicationId} is out of stock`, 400);
        }
    }

    const medications = await prisma.medication.findMany({
        where: { id: { in: medicationIds } },
        select: { id: true, unitPrice: true },
    });

    const priceMap = {};
    for (const med of medications) {
        priceMap[med.id.toString()] = Number(med.unitPrice);
    }

    const reservation = await prisma.$transaction(async (tx) => {
        let totalPrice = 0;
        const reservationItems = items.map((item) => {
            const unitPrice = priceMap[item.medicationId];
            if (!unitPrice) {
                throw new AppError(`Medication ${item.medicationId} not found`, 404);
            }
            const subtotal = unitPrice * item.quantity;
            totalPrice += subtotal;
            return {
                medicationId: item.medicationId,
                quantity: item.quantity,
                unitPrice,
                subtotal,
            };
        });

        const created = await tx.reservation.create({
            data: {
                userId,
                status: "pending",
                deliveryDate: new Date(deliveryDate),
                totalPrice,
                items: {
                    create: reservationItems,
                },
            },
            include: { items: true },
        });

        return created;
    });

    return reservation;
}

export async function getUserReservationsService(userId, filters = {}) {
    const where = { userId };

    if (filters.status) {
        where.status = filters.status;
    }

    const reservations = await prisma.reservation.findMany({
        where,
        include: {
            items: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return reservations;
}

export async function deleteReservationService(userId, reservationId) {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        select: { id: true, userId: true, status: true },
    });

    if (!reservation) {
        throw new AppError("Reservation not found", 404);
    }

    if (reservation.userId !== userId) {
        throw new AppError("Unauthorized", 403);
    }

    if (reservation.status !== "pending") {
        throw new AppError("Not allowed to delete this reservation", 403);
    }

    await prisma.$transaction(async (tx) => {
        await tx.reservationItem.deleteMany({ where: { reservationId } });
        await tx.reservation.delete({ where: { id: reservationId } });
    });
}
