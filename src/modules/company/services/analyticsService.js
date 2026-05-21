import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const LOW_STOCK_THRESHOLD = 50;

export const getMedicationsTableAnalyticsService = async (companyId, { regionId, categoryId, search, page, limit, from, to }) => {
    // 1. Verify region exists
    const region = await prisma.region.findUnique({
        where: { id: regionId },
    });
    if (region == null) {
        throw new AppError("Region not found", 404);
    }

    // 2. Fetch all active pharmacies in this region
    const activePharmacies = await prisma.pharmacy.findMany({
        where: {
            regionId: regionId,
            accountStatus: "active",
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });
    const pharmacyIds = activePharmacies.map((p) => p.id);

    // 3. Query medications for this company
    const whereClause = {
        companyId: companyId,
        deletedAt: null,
    };
    if (categoryId != null) {
        whereClause.categoryId = categoryId;
    }
    if (search != null && search != "") {
        whereClause.OR = [
            { brandName: { contains: search, mode: "insensitive" } },
            { genericName: { contains: search, mode: "insensitive" } },
        ];
    }

    const totalRecords = await prisma.medication.count({
        where: whereClause,
    });

    const skip = (page - 1) * limit;

    const medications = await prisma.medication.findMany({
        where: whereClause,
        include: {
            category: {
                select: {
                    categoryName: true,
                },
            },
        },
        orderBy: {
            brandName: "asc",
        },
        skip,
        take: limit,
    });

    // Maps to cache query data
    const adjustmentsMap = new Map();
    const demandLogsMap = new Map();
    const replacementStatsMap = new Map();

    if (pharmacyIds.length > 0 && medications.length > 0) {
        const medicationIds = medications.map((m) => m.id);

        // Fetch inventory adjustments (applying date range filters if specified)
        const adjustmentsQueryFilter = {
            medicationId: { in: medicationIds },
            pharmacyId: { in: pharmacyIds },
        };
        if (from != null || to != null) {
            adjustmentsQueryFilter.createdAt = {};
            if (from != null) adjustmentsQueryFilter.createdAt.gte = from;
            if (to != null) adjustmentsQueryFilter.createdAt.lte = to;
        }

        const adjustments = await prisma.inventoryAdjustment.findMany({
            where: adjustmentsQueryFilter,
            select: {
                pharmacyId: true,
                medicationId: true,
                adjustmentType: true,
                quantity: true,
            },
        });
        for (const adj of adjustments) {
            const key = `${adj.medicationId}_${adj.pharmacyId}`;
            if (!adjustmentsMap.has(key)) {
                adjustmentsMap.set(key, { IN: 0, OUT: 0 });
            }
            const counts = adjustmentsMap.get(key);
            if (adj.adjustmentType == "IN") {
                counts.IN += adj.quantity;
            } else if (adj.adjustmentType == "OUT") {
                counts.OUT += adj.quantity;
            }
        }

        // Fetch demand logs (applying date range filters if specified)
        const demandQueryFilter = {
            medicationId: { in: medicationIds },
            pharmacyId: { in: pharmacyIds },
        };
        if (from != null || to != null) {
            demandQueryFilter.createdAt = {};
            if (from != null) demandQueryFilter.createdAt.gte = from;
            if (to != null) demandQueryFilter.createdAt.lte = to;
        }

        const demandLogs = await prisma.demandLog.findMany({
            where: demandQueryFilter,
        });
        for (const log of demandLogs) {
            const medIdStr = log.medicationId.toString();
            demandLogsMap.set(medIdStr, (demandLogsMap.get(medIdStr) || 0) + 1);
        }

        // Fetch replacement demand logs (applying date range filters if specified)
        const replacementQueryFilter = {
            medicationId: { in: medicationIds },
            pharmacyId: { in: pharmacyIds },
            demandType: { in: ["REPLACEMENT_ACCEPTED", "REPLACEMENT_REFUSED"] },
        };
        if (from != null || to != null) {
            replacementQueryFilter.createdAt = {};
            if (from != null) replacementQueryFilter.createdAt.gte = from;
            if (to != null) replacementQueryFilter.createdAt.lte = to;
        }

        const replacementLogs = await prisma.demandLog.findMany({
            where: replacementQueryFilter,
        });
        for (const log of replacementLogs) {
            const medIdStr = log.medicationId.toString();
            if (!replacementStatsMap.has(medIdStr)) {
                replacementStatsMap.set(medIdStr, { accepted: 0, refused: 0 });
            }
            const stats = replacementStatsMap.get(medIdStr);
            if (log.demandType == "REPLACEMENT_ACCEPTED") {
                stats.accepted++;
            } else {
                stats.refused++;
            }
        }
    }

    // 4. Map results
    const results = medications.map((medication) => {
        const medIdStr = medication.id.toString();

        let totalInventory = 0;
        let noOfPharmaciesStocked = 0;
        let noOfPharmaciesCritical = 0;
        let noOfPharmaciesShortage = 0;

        for (const pharmacy of activePharmacies) {
            const key = `${medication.id}_${pharmacy.id}`;
            const adj = adjustmentsMap.get(key) || { IN: 0, OUT: 0 };
            const stock = adj.IN - adj.OUT;

            totalInventory += stock;
            if (stock > LOW_STOCK_THRESHOLD) {
                noOfPharmaciesStocked++;
            } else if (stock > 0) {
                noOfPharmaciesCritical++;
            } else {
                noOfPharmaciesShortage++;
            }
        }

        const demandLast30Days = demandLogsMap.get(medIdStr) || 0;

        const replacementStats = replacementStatsMap.get(medIdStr) || { accepted: 0, refused: 0 };
        const totalReplacements = replacementStats.accepted + replacementStats.refused;
        console.log(totalReplacements);
        const percentageCustomersAccepted =
            totalReplacements == 0 ? 0 : Number(((replacementStats.accepted / totalReplacements) * 100).toFixed(2));
        const percentageCustomersRefused =
            totalReplacements == 0 ? 0 : Number(((replacementStats.refused / totalReplacements) * 100).toFixed(2));

        return {
            id: medication.id,
            medicationName: medication.brandName,
            brandName: medication.brandName,
            genericName: medication.genericName,
            category: medication.category.categoryName,
            region: region.name,
            totalInventory,
            noOfPharmaciesStocked,
            noOfPharmaciesCritical,
            noOfPharmaciesShortage,
            demandLast30Days,
            percentageCustomersAccepted,
            percentageCustomersRefused,
        };
    });

    return {
        recordsCount: totalRecords,
        page,
        limit,
        data: results,
    };
};
