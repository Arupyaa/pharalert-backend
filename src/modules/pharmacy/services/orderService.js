import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

export async function createOrderService(pharmacyId, data) {
    const { supplierName, items, paymentMethod, notes } = data;

    const medicationIds = items.map((item) => item.medicationId);
    const medications = await prisma.medication.findMany({
        where: { id: { in: medicationIds } },
    });

    if (medications.length !== medicationIds.length) {
        const foundIds = medications.map((m) => Number(m.id));
        const missing = medicationIds.filter((id) => !foundIds.includes(id));
        throw new AppError(`Medications not found: ${missing.join(", ")}`, 400);
    }

    const medicationMap = new Map(
        medications.map((m) => [Number(m.id), m])
    );

    let totalPrice = 0;
    for (const item of items) {
        const med = medicationMap.get(item.medicationId);
        const unitPrice = Number(med.unitPrice);
        totalPrice += unitPrice * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
            data: {
                pharmacyId,
                supplierName,
                totalPrice,
                paymentStatus: "fully_paid",
                items: {
                    create: items.map((item) => {
                        const med = medicationMap.get(item.medicationId);
                        const unitPrice = Number(med.unitPrice);
                        return {
                            medicationId: item.medicationId,
                            quantity: item.quantity,
                            unitPrice,
                            totalPrice: unitPrice * item.quantity,
                        };
                    }),
                },
            },
            include: { items: true },
        });

        for (const item of items) {
            const existingInventory = await tx.pharmacyInventory.findFirst({
                where: {
                    pharmacyId,
                    medicationId: item.medicationId,
                },
            });

            if (existingInventory) {
                await tx.pharmacyInventory.update({
                    where: { id: existingInventory.id },
                    data: {
                        stock: { increment: item.quantity },
                        updatedAt: new Date(),
                    },
                });
            } else {
                await tx.pharmacyInventory.create({
                    data: {
                        pharmacyId,
                        medicationId: item.medicationId,
                        stock: item.quantity,
                        updatedAt: new Date(),
                    },
                });
            }
        }

        await tx.inventoryAdjustment.createMany({
            data: items.map((item) => ({
                pharmacyId,
                medicationId: item.medicationId,
                adjustmentType: "IN",
                quantity: item.quantity,
                reason: "ORDER",
                referenceOrderId: createdOrder.id,
                notes: notes || null,
            })),
        });

        await tx.payment.create({
            data: {
                orderId: createdOrder.id,
                paymentAmount: totalPrice,
                paymentMethod,
                paymentDate: new Date(),
            },
        });

        return createdOrder;
    });

    return order;
}
