import prisma from "../../../prisma.js";

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
        companyName: inventory.medication.company.companyName,

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

    const where = {
        pharmacyId,

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
        .filter(record => {
            if (!stockStatus) return true;

            return record.stockStatus == stockStatus;
        });

    return {
        recordsCount: totalRecords,
        page,
        limit,
        data: formatted,
    };
}


//get inventory by medicationId service code


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
        companyName: inventory.medication.company.companyName,

        stock: inventory.stock,
        stockStatus: getStockStatus(inventory.stock),

        unitPrice: inventory.medication.unitPrice,
        inventoryValue: Number(inventory.medication.unitPrice) * inventory.stock,

        updatedAt: inventory.updatedAt,
    };
}