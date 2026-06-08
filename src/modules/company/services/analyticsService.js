import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const LOW_STOCK_THRESHOLD = 50;

export const getPharmaciesTableAnalyticsService = async ({ medicationId, regionId, status, search, page, limit, from, to, categoryId }) => {
    // 1. Get all medications with optional category and medication filters
    const medicationWhere = { deletedAt: null };
    if (categoryId != null) medicationWhere.categoryId = categoryId;
    if (medicationId != null) medicationWhere.id = medicationId;

    const medications = await prisma.medication.findMany({
        where: medicationWhere,
        include: { category: { select: { categoryName: true } } },
    });

    if (medications.length === 0) {
        return { recordsCount: 0, page, limit, data: [] };
    }

    const medicationIds = medications.map(m => m.id);

    // 2. Find pharmacies that have adjustments for any of these medications
    const adjustmentPharmacies = await prisma.inventoryAdjustment.findMany({
        where: {
            medicationId: { in: medicationIds },
            pharmacy: { deletedAt: null },
        },
        select: { pharmacyId: true },
        distinct: ["pharmacyId"],
    });

    const inventoryPharmacies = await prisma.pharmacyInventory.findMany({
        where: {
            medicationId: { in: medicationIds },
            pharmacy: { deletedAt: null },
        },
        select: { pharmacyId: true },
        distinct: ["pharmacyId"],
    });

    let pharmacyIds = [
        ...new Set([
            ...adjustmentPharmacies.map(a => a.pharmacyId),
            ...inventoryPharmacies.map(p => p.pharmacyId),
        ]),
    ];

    if (pharmacyIds.length === 0) {
        return { recordsCount: 0, page, limit, data: [] };
    }

    // 3. Filter pharmacies by regionId, accountStatus, search
    const pharmacyWhere = {
        id: { in: pharmacyIds },
        deletedAt: null,
    };
    if (regionId != null) {
        pharmacyWhere.regionId = regionId;
    }
    if (status != null) {
        pharmacyWhere.accountStatus = status;
    }
    if (search != null && search !== "") {
        pharmacyWhere.name = { contains: search, mode: "insensitive" };
    }

    const totalRecords = await prisma.pharmacy.count({ where: pharmacyWhere });

    const pharmacies = await prisma.pharmacy.findMany({
        where: pharmacyWhere,
        include: { region: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
    });

    const pharmacyIdsFiltered = pharmacies.map(p => p.id);

    // 4. Fetch inventory adjustments with optional date range
    const adjustmentsQuery = {
        pharmacyId: { in: pharmacyIdsFiltered },
        medicationId: { in: medicationIds },
    };
    if (from != null || to != null) {
        adjustmentsQuery.createdAt = {};
        if (from != null) adjustmentsQuery.createdAt.gte = from;
        if (to != null) adjustmentsQuery.createdAt.lte = to;
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
        where: adjustmentsQuery,
        select: {
            pharmacyId: true,
            medicationId: true,
            adjustmentType: true,
            quantity: true,
            createdAt: true,
        },
    });

    const inventoryMap = new Map();
    const lastUpdatedMap = new Map();

    for (const adj of adjustments) {
        const key = `${adj.medicationId}_${adj.pharmacyId}`;
        if (!inventoryMap.has(key)) {
            inventoryMap.set(key, { IN: 0, OUT: 0 });
        }
        const counts = inventoryMap.get(key);
        if (adj.adjustmentType === "IN") counts.IN += adj.quantity;
        else if (adj.adjustmentType === "OUT") counts.OUT += adj.quantity;

        const phId = adj.pharmacyId;
        const current = lastUpdatedMap.get(phId);
        if (!current || adj.createdAt > current) {
            lastUpdatedMap.set(phId, adj.createdAt);
        }
    }

    // 5. Fetch demand logs with optional date range
    const demandQuery = {
        pharmacyId: { in: pharmacyIdsFiltered },
        medicationId: { in: medicationIds },
    };
    if (from != null || to != null) {
        demandQuery.createdAt = {};
        if (from != null) demandQuery.createdAt.gte = from;
        if (to != null) demandQuery.createdAt.lte = to;
    }

    const demandLogs = await prisma.demandLog.findMany({ where: demandQuery });

    const demandMap = new Map();
    for (const log of demandLogs) {
        const key = `${log.medicationId}_${log.pharmacyId}`;
        demandMap.set(key, (demandMap.get(key) || 0) + 1);
    }

    // 6. Fetch replacement stats with optional date range
    const replacementQuery = {
        pharmacyId: { in: pharmacyIdsFiltered },
        medicationId: { in: medicationIds },
        demandType: { in: ["REPLACEMENT_ACCEPTED", "REPLACEMENT_REFUSED"] },
    };
    if (from != null || to != null) {
        replacementQuery.createdAt = {};
        if (from != null) replacementQuery.createdAt.gte = from;
        if (to != null) replacementQuery.createdAt.lte = to;
    }

    const replacementLogs = await prisma.demandLog.findMany({ where: replacementQuery });

    const replacementMap = new Map();
    for (const log of replacementLogs) {
        const key = `${log.medicationId}_${log.pharmacyId}`;
        if (!replacementMap.has(key)) {
            replacementMap.set(key, { accepted: 0, refused: 0 });
        }
        const stats = replacementMap.get(key);
        if (log.demandType === "REPLACEMENT_ACCEPTED") stats.accepted++;
        else stats.refused++;
    }

    // 7. Build results
    const results = pharmacies.map(pharmacy => {
        let shortageCount = 0;
        let criticalCount = 0;
        let stockedCount = 0;
        const pharmacyMeds = [];

        for (const medication of medications) {
            const key = `${medication.id}_${pharmacy.id}`;
            const adj = inventoryMap.get(key) || { IN: 0, OUT: 0 };

            if (adj.IN === 0 && adj.OUT === 0) continue;

            const inventory = adj.IN - adj.OUT;

            let inventoryStatus;
            if (inventory <= 0) {
                inventoryStatus = "shortage";
                shortageCount++;
            } else if (inventory <= LOW_STOCK_THRESHOLD) {
                inventoryStatus = "critical";
                criticalCount++;
            } else {
                inventoryStatus = "stocked";
                stockedCount++;
            }

            const demand = demandMap.get(key) || 0;
            const replacementStats = replacementMap.get(key) || { accepted: 0, refused: 0 };
            const totalReplacements = replacementStats.accepted + replacementStats.refused;
            const percentageAccepted = totalReplacements === 0
                ? 0
                : Number(((replacementStats.accepted / totalReplacements) * 100).toFixed(2));
            const percentageRefused = totalReplacements === 0
                ? 0
                : Number(((replacementStats.refused / totalReplacements) * 100).toFixed(2));

            pharmacyMeds.push({
                medicationName: medication.brandName,
                generic: medication.genericName,
                category: medication.category.categoryName,
                inventoryStatus,
                inventory,
                demand,
                percentageCustomersAcceptedReplacements: percentageAccepted,
                percentageCustomersRefused: percentageRefused,
            });
        }

        return {
            pharmacyName: pharmacy.name,
            region: pharmacy.region.name,
            address: pharmacy.address,
            accountStatus: pharmacy.accountStatus,
            noOfMedsInShortage: shortageCount,
            noOfMedsInCritical: criticalCount,
            noOfMedsStocked: stockedCount,
            lastUpdated: lastUpdatedMap.get(pharmacy.id) || null,
            medications: pharmacyMeds,
        };
    });

    return {
        recordsCount: totalRecords,
        page,
        limit,
        data: results,
    };
};

export const getMedicationsTableAnalyticsService = async ({ regionId, categoryId, search, page, limit, from, to }) => {
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

    // 3. Query all medications
    const whereClause = {
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

export const getRegionsChartsAnalyticsService = async ({ medicationId, from, to }) => {
    const medication = await prisma.medication.findFirst({
        where: { id: medicationId, deletedAt: null },
    });
    if (!medication) {
        throw new AppError("Medication not found", 404);
    }

    const adjustmentsQuery = { medicationId };
    if (from != null || to != null) {
        adjustmentsQuery.createdAt = {};
        if (from != null) adjustmentsQuery.createdAt.gte = from;
        if (to != null) adjustmentsQuery.createdAt.lte = to;
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
        where: adjustmentsQuery,
        select: {
            pharmacyId: true,
            adjustmentType: true,
            quantity: true,
        },
    });

    const pharmacyInventoryMap = new Map();
    for (const adj of adjustments) {
        const current = pharmacyInventoryMap.get(adj.pharmacyId) || 0;
        if (adj.adjustmentType === "IN") {
            pharmacyInventoryMap.set(adj.pharmacyId, current + adj.quantity);
        } else {
            pharmacyInventoryMap.set(adj.pharmacyId, current - adj.quantity);
        }
    }

    const activePharmacies = await prisma.pharmacy.findMany({
        where: { deletedAt: null, accountStatus: "active" },
        select: { id: true, regionId: true },
    });

    const regionPharmacyMap = new Map();
    for (const ph of activePharmacies) {
        if (!regionPharmacyMap.has(ph.regionId)) {
            regionPharmacyMap.set(ph.regionId, []);
        }
        regionPharmacyMap.get(ph.regionId).push(ph.id);
    }

    const regions = await prisma.region.findMany({
        orderBy: { name: "asc" },
    });

    const results = regions.map(region => {
        const regionPharmacyIds = regionPharmacyMap.get(region.id) || [];

        let inStock = 0;
        let critical = 0;
        let inShortage = 0;

        for (const phId of regionPharmacyIds) {
            const inventory = pharmacyInventoryMap.get(phId) || 0;

            if (inventory > LOW_STOCK_THRESHOLD) {
                inStock++;
            } else if (inventory > 0) {
                critical++;
            } else {
                inShortage++;
            }
        }

        return {
            region: region.name,
            inStock,
            critical,
            inShortage,
        };
    });

    return results;
};

const DEMAND_TYPES = ["PURCHASED", "REPLACEMENT_ACCEPTED", "REPLACEMENT_REFUSED", "NO_ACTION"];

export const getDemandChartsAnalyticsService = async ({ medicationId, regionId, from, to }) => {
    const medication = await prisma.medication.findFirst({
        where: { id: medicationId, deletedAt: null },
    });
    if (!medication) {
        throw new AppError("Medication not found", 404);
    }

    const pharmacyWhere = { deletedAt: null, accountStatus: "active" };
    if (regionId != null) pharmacyWhere.regionId = regionId;

    const pharmacies = await prisma.pharmacy.findMany({
        where: pharmacyWhere,
        select: { id: true },
    });

    if (pharmacies.length === 0) return [];

    const pharmacyIds = pharmacies.map(p => p.id);

    const demandQuery = {
        medicationId,
        pharmacyId: { in: pharmacyIds },
    };
    if (from != null || to != null) {
        demandQuery.createdAt = {};
        if (from != null) demandQuery.createdAt.gte = from;
        if (to != null) demandQuery.createdAt.lte = to;
    }

    const demandLogs = await prisma.demandLog.findMany({
        where: demandQuery,
        select: {
            demandType: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    if (demandLogs.length === 0) return [];

    const dailyTypeCount = new Map();
    for (const log of demandLogs) {
        const dateStr = log.createdAt.toISOString().split("T")[0];
        if (!dailyTypeCount.has(dateStr)) {
            dailyTypeCount.set(dateStr, {});
        }
        const dayData = dailyTypeCount.get(dateStr);
        dayData[log.demandType] = (dayData[log.demandType] || 0) + 1;
    }

    const sortedDates = [...dailyTypeCount.keys()].sort();

    const results = sortedDates.map(dateStr => {
        const dayData = dailyTypeCount.get(dateStr);
        const entry = { date: dateStr };
        for (const type of DEMAND_TYPES) {
            entry[type] = dayData[type] || 0;
        }
        return entry;
    });

    return results;
};

export const getMedicationsChartsAnalyticsService = async ({ regionId, from, to }) => {
    const medications = await prisma.medication.findMany({
        where: { deletedAt: null },
        select: { id: true, brandName: true },
        orderBy: { brandName: "asc" },
    });

    if (medications.length === 0) return [];

    const medicationIds = medications.map(m => m.id);
    const medicationNameMap = new Map(medications.map(m => [m.id, m.brandName]));

    const pharmacyWhere = { deletedAt: null, accountStatus: "active" };
    if (regionId != null) pharmacyWhere.regionId = regionId;

    const pharmacies = await prisma.pharmacy.findMany({
        where: pharmacyWhere,
        select: { id: true },
    });

    if (pharmacies.length === 0) return [];

    const pharmacyIds = pharmacies.map(p => p.id);

    const adjustmentsQuery = {
        medicationId: { in: medicationIds },
        pharmacyId: { in: pharmacyIds },
    };
    if (from != null || to != null) {
        adjustmentsQuery.createdAt = {};
        if (from != null) adjustmentsQuery.createdAt.gte = from;
        if (to != null) adjustmentsQuery.createdAt.lte = to;
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
        where: adjustmentsQuery,
        select: {
            medicationId: true,
            adjustmentType: true,
            quantity: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    if (adjustments.length === 0) return [];

    const dailyNetChange = new Map();
    for (const adj of adjustments) {
        const dateStr = adj.createdAt.toISOString().split("T")[0];
        if (!dailyNetChange.has(dateStr)) {
            dailyNetChange.set(dateStr, new Map());
        }
        const dayMap = dailyNetChange.get(dateStr);
        const medId = adj.medicationId;
        const current = dayMap.get(medId) || 0;
        dayMap.set(medId, current + (adj.adjustmentType === "IN" ? adj.quantity : -adj.quantity));
    }

    const sortedDates = [...dailyNetChange.keys()].sort();
    const runningInventory = new Map();

    const results = sortedDates.map(dateStr => {
        const dayChanges = dailyNetChange.get(dateStr);
        const entry = { date: dateStr };

        for (const med of medications) {
            const change = dayChanges.get(med.id) || 0;
            const currentRunning = runningInventory.get(med.id) || 0;
            const newRunning = currentRunning + change;
            runningInventory.set(med.id, newRunning);
            entry[med.brandName] = newRunning;
        }

        return entry;
    });

    return results;
};

export const getPharmaciesChartsAnalyticsService = async ({ regionId, from, to }) => {
    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) throw new AppError("Region not found", 404);

    const medications = await prisma.medication.findMany({
        where: { deletedAt: null },
        select: { id: true, brandName: true },
        orderBy: { brandName: "asc" },
    });

    if (medications.length === 0) return [];

    const medicationIds = medications.map(m => m.id);

    const pharmacies = await prisma.pharmacy.findMany({
        where: { regionId, deletedAt: null, accountStatus: "active" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    if (pharmacies.length === 0) return [];

    const pharmacyIds = pharmacies.map(p => p.id);

    const adjustmentsQuery = {
        medicationId: { in: medicationIds },
        pharmacyId: { in: pharmacyIds },
    };
    if (from != null || to != null) {
        adjustmentsQuery.createdAt = {};
        if (from != null) adjustmentsQuery.createdAt.gte = from;
        if (to != null) adjustmentsQuery.createdAt.lte = to;
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
        where: adjustmentsQuery,
        select: {
            pharmacyId: true,
            medicationId: true,
            adjustmentType: true,
            quantity: true,
        },
    });

    const pharmacyMedInventory = new Map();
    for (const adj of adjustments) {
        const key = `${adj.pharmacyId}_${adj.medicationId}`;
        const current = pharmacyMedInventory.get(key) || 0;
        if (adj.adjustmentType === "IN") {
            pharmacyMedInventory.set(key, current + adj.quantity);
        } else {
            pharmacyMedInventory.set(key, current - adj.quantity);
        }
    }

    const results = pharmacies.map(pharmacy => {
        const entry = { pharmacy: pharmacy.name };
        for (const med of medications) {
            const key = `${pharmacy.id}_${med.id}`;
            entry[med.brandName] = pharmacyMedInventory.get(key) || 0;
        }
        return entry;
    });

    return results;
};

export const getSummaryAnalyticsService = async ({ medicationId, from, to }) => {
    const medication = await prisma.medication.findFirst({
        where: { id: medicationId, deletedAt: null },
    });
    if (!medication) {
        throw new AppError("Medication not found", 404);
    }

    const adjustmentsQuery = { medicationId };
    if (from != null || to != null) {
        adjustmentsQuery.createdAt = {};
        if (from != null) adjustmentsQuery.createdAt.gte = from;
        if (to != null) adjustmentsQuery.createdAt.lte = to;
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
        where: adjustmentsQuery,
        select: {
            pharmacyId: true,
            adjustmentType: true,
            quantity: true,
        },
    });

    let totalInventory = 0;
    const pharmacyInventoryMap = new Map();
    for (const adj of adjustments) {
        if (adj.adjustmentType === "IN") {
            totalInventory += adj.quantity;
            const current = pharmacyInventoryMap.get(adj.pharmacyId) || 0;
            pharmacyInventoryMap.set(adj.pharmacyId, current + adj.quantity);
        } else {
            totalInventory -= adj.quantity;
            const current = pharmacyInventoryMap.get(adj.pharmacyId) || 0;
            pharmacyInventoryMap.set(adj.pharmacyId, current - adj.quantity);
        }
    }

    const demandQuery = { medicationId };
    if (from != null || to != null) {
        demandQuery.createdAt = {};
        if (from != null) demandQuery.createdAt.gte = from;
        if (to != null) demandQuery.createdAt.lte = to;
    }

    const totalDemand = await prisma.demandLog.count({ where: demandQuery });

    const activePharmacies = await prisma.pharmacy.findMany({
        where: { deletedAt: null, accountStatus: "active" },
        select: { id: true, regionId: true },
    });

    const regionCountMap = new Map();
    const regionIds = new Set();
    for (const ph of activePharmacies) {
        const inventory = pharmacyInventoryMap.get(ph.id) || 0;
        regionIds.add(ph.regionId);
        if (inventory <= 0) {
            regionCountMap.set(ph.regionId, (regionCountMap.get(ph.regionId) || 0) + 1);
        }
    }

    const regions = await prisma.region.findMany({
        where: { id: { in: [...regionIds] } },
        select: { id: true, name: true },
    });

    const regionNameMap = new Map(regions.map(r => [r.id, r.name]));

    const regionsInShortage = [...regionCountMap.entries()]
        .map(([regionId, count]) => ({
            region: regionNameMap.get(regionId),
            pharmaciesInShortage: count,
        }))
        .sort((a, b) => b.pharmaciesInShortage - a.pharmaciesInShortage);

    return {
        totalInventory,
        totalDemand,
        regionsInShortage,
    };
};
