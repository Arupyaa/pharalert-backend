import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const LOW_STOCK_THRESHOLD = 30;

function getStockStatus(stock) {
    if (stock == 0) return "out_of_stock";
    if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
    return "in_stock";
}

function buildInventoryRow(inventory, demandLogs) {
    const stockStatus = getStockStatus(inventory.stock);

    const purchasedCount = demandLogs.filter(
        log => log.demandType == "PURCHASED"
    ).length;

    const acceptedCount = demandLogs.filter(
        log => log.demandType == "REPLACEMENT_ACCEPTED"
    ).length;

    const refusedCount = demandLogs.filter(
        log => log.demandType == "REPLACEMENT_REFUSED"
    ).length;

    const replacementAttempts = acceptedCount + refusedCount;

    const replacementAcceptanceRate =
        replacementAttempts == 0
            ? 0
            : Number(
                ((acceptedCount / replacementAttempts) * 100).toFixed(2)
            );

    const replacementRefusalRate =
        replacementAttempts == 0
            ? 0
            : Number(
                ((refusedCount / replacementAttempts) * 100).toFixed(2)
            );

    return {
        inventoryId: inventory.id,
        medicationId: inventory.medication.id,

        brandName: inventory.medication.brandName,
        genericName: inventory.medication.genericName,

        categoryName: inventory.medication.category.categoryName,
        companyName: inventory.medication.company?.companyName ?? inventory.medication.manufacturingCompany,

        stock: inventory.stock,

        stockStatus,

        unitPrice: inventory.medication.unitPrice,

        inventoryValue:
            Number(inventory.medication.unitPrice) * inventory.stock,

        demandCount: purchasedCount,

        replacementAcceptanceRate,
        replacementRefusalRate,

        updatedAt: inventory.updatedAt,
    };
}

// get inventory service code
export async function getInventoryService(pharmacyId, query) {
    const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        stockStatus,
        sortBy = "inventoryValue",
        order = "asc",
    } = query;

    const skip = (page - 1) * limit;

    let stockFilter = {};

    if (stockStatus === "out_of_stock") {
        stockFilter = {
            stock: 0,
        };
    }

    if (stockStatus === "low_stock") {
        stockFilter = {
            stock: {
                gt: 0,
                lte: LOW_STOCK_THRESHOLD,
            },
        };
    }

    if (stockStatus === "in_stock") {
        stockFilter = {
            stock: {
                gt: LOW_STOCK_THRESHOLD,
            },
        };
    }

    const where = {
        pharmacyId,

        ...stockFilter,

        medication: {
            ...(search
                ? {
                    OR: [
                        {
                            brandName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            genericName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),

            ...(categoryId
                ? {
                    categoryId,
                }
                : {}),
        },
    };

    const totalRecords = await prisma.pharmacyInventory.count({
        where,
    });

    const inventoryRecords = await prisma.pharmacyInventory.findMany({
        where,

        include: {
            medication: {
                include: {
                    category: true,
                    company: true,
                },
            },
        },

        skip,
        take: limit,

        orderBy:
            sortBy == "updatedAt"
                ? {
                    updatedAt: order,
                }
                : {
                    stock: order,
                },
    });

    const medicationIds = inventoryRecords.map(
        item => item.medicationId
    );

    const demandLogs = await prisma.demandLog.findMany({
        where: {
            pharmacyId,
            medicationId: {
                in: medicationIds,
            },
        },
    });

    const formatted = inventoryRecords
        .map(record => {
            const medicationDemandLogs = demandLogs.filter(
                log =>
                    Number(log.medicationId) ==
                    Number(record.medicationId)
            );

            return buildInventoryRow(
                record,
                medicationDemandLogs
            );
        })

    return {
        recordsCount: totalRecords,
        page,
        limit,
        data: formatted,
    };
}


//get inventory by medicationId service code


export async function addInventoryService(pharmacyId, data) {
    const { medicationId, quantity, notes } = data;

    const medication = await prisma.medication.findUnique({
        where: { id: medicationId },
    });

    if (!medication) {
        throw new AppError("Medication not found", 404);
    }

    let previousStock = 0;

    const result = await prisma.$transaction(async (tx) => {
        const existingInventory = await tx.pharmacyInventory.findFirst({
            where: { pharmacyId, medicationId },
        });

        previousStock = existingInventory?.stock || 0;

        if (existingInventory) {
            await tx.pharmacyInventory.update({
                where: { id: existingInventory.id },
                data: {
                    stock: { increment: quantity },
                    updatedAt: new Date(),
                },
            });
        } else {
            await tx.pharmacyInventory.create({
                data: {
                    pharmacyId,
                    medicationId,
                    stock: quantity,
                    updatedAt: new Date(),
                },
            });
        }

        const adjustment = await tx.inventoryAdjustment.create({
            data: {
                pharmacyId,
                medicationId,
                adjustmentType: "IN",
                quantity,
                reason: "MANUAL_ADJUSTMENT",
                notes: notes || null,
            },
        });

        return adjustment;
    });

    if (previousStock === 0) {
        const { checkAndNotifyStockAlert } = await import("../../user/services/stockAlertService.js");
        await checkAndNotifyStockAlert(pharmacyId, medicationId);
    }

    return result;
}

export async function getInventoryByMedicationIdService(pharmacyId, medicationId) {
    const inventory = await prisma.pharmacyInventory.findFirst({
        where: {
            pharmacyId,
            medicationId,
        },
        include: {
            medication: {
                include: {
                    category: true,
                    company: true,
                },
            },
        },
    });

    if (!inventory) return null;

    return {
        inventoryId: inventory.id,
        medicationId: inventory.medicationId,

        brandName: inventory.medication.brandName,
        genericName: inventory.medication.genericName,

        categoryName: inventory.medication.category.categoryName,
        companyName: inventory.medication.company?.companyName ?? inventory.medication.manufacturingCompany,

        stock: inventory.stock,
        stockStatus: getStockStatus(inventory.stock),

        unitPrice: inventory.medication.unitPrice,
        inventoryValue: Number(inventory.medication.unitPrice) * inventory.stock,

        updatedAt: inventory.updatedAt,
    };
}