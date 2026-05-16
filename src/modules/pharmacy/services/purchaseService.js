import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

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