import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";

//service functions for get request
export async function getPurchasesService(pharmacyId, filters) {
    console.log("pharmacyId:", pharmacyId);
    const {
        page = 1,
        limit = 10,
        from,
        to,
        medicationId,
        order = "desc",
    } = filters;

    const where = {
        pharmacyId,
        ...(from || to
            ? {
                createdAt: {
                    ...(from && { gte: from }),
                    ...(to && { lte: to }),
                },
            }
            : {}),
        ...(medicationId && {
            items: {
                some: {
                    medicationId,
                },
            },
        }),
    };

    const purchases = await prisma.purchase.findMany({
        where,
        include: {
            items: true,
        },
        orderBy: {
            createdAt: order,
        },
        skip: (page - 1) * limit,
        take: limit,
    });
    const totalRecords = await prisma.purchase.count({ where });
    const totalPages = Math.ceil(totalRecords / limit);
    const formatted = purchases.map(buildReceipt);

    return {
        data: formatted,
        pagination: {
            totalRecords,
            page,
            limit,
            totalPages
        }
    };
}

//const for the tax rate
const TAX_RATE = 0.14;

function buildReceipt(purchase) {
    let itemAmount = 0;
    let subtotal = 0;
    let discount = 0;

    for (const item of purchase.items) {
        itemAmount += item.quantity;
        subtotal += Number(item.unitPrice) * item.quantity;
        discount += Number(item.medicationDiscount || 0);
    }

    return {
        orderNo: purchase.id,
        customerName: purchase.customerName,
        date: purchase.createdAt,
        itemAmount,
        subtotal,
        discount,
        tax: TAX_RATE,
        total: purchase.totalPrice,
        items: purchase.items,
    };
}


//service functions for the post request

export async function createPurchaseService(pharmacyId, data) {
    const { customerName, paymentStatus = "fully_paid", totalPrice, items } = data;

    // sanity check inventory first
    const inventoryRecords = serializeBigInt(await prisma.pharmacyInventory.findMany({
        where: {
            pharmacyId,
            medicationId: {
                in: items.map(item => item.medicationId),
            },
        },
    }));
    console.log(inventoryRecords);
    for (const item of items) {
        const inventory = inventoryRecords.find(
            inv => inv.medicationId == item.medicationId
        );

        if (!inventory) {
            throw new AppError(
                `Medication ${item.medicationId} not found in inventory`,
                400
            );
        }

        if (inventory.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for medication ${item.medicationId}`,
                400
            );
        }
    }

    const purchase = await prisma.$transaction(async tx => {
        // demand logs
        await tx.demandLog.createMany({
            data: items.map(item => ({
                pharmacyId,
                medicationId: item.medicationId,
                demandType: "PURCHASED",
            })),
        });

        // inventory updates
        for (const item of items) {
            await tx.pharmacyInventory.updateMany({
                where: {
                    pharmacyId,
                    medicationId: item.medicationId,
                },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // purchase creation
        const createdPurchase = await tx.purchase.create({
            data: {
                pharmacyId,
                customerName,
                paymentStatus,
                totalPrice,

                items: {
                    create: items.map(item => ({
                        medicationId: item.medicationId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        medicationDiscount: item.medicationDiscount,
                        totalPrice: item.totalPrice,
                    })),
                },
            },

            include: {
                items: true,
            },
        });

        // adjustment logs
        await tx.inventoryAdjustment.createMany({
            data: items.map(item => ({
                pharmacyId,
                medicationId: item.medicationId,
                adjustmentType: "OUT",
                quantity: item.quantity,
                reason: "PURCHASE",
                referencePurchaseId: createdPurchase.id,
            })),
        });

        //payment creation
        await tx.payment.create({
            data: {
                purchaseId: createdPurchase.id,
                paymentAmount: totalPrice,
                paymentMethod: "cash",
                paymentDate: new Date(),
            },
        });

        return createdPurchase;
    });

    return purchase;
}