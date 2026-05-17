import prisma from "../../../prisma.js";
function aggregatePurchases(purchases) {
    const map = new Map();

    for (const purchase of purchases) {
        for (const item of purchase.items) {
            const key = item.medicationId.toString();

            if (!map.has(key)) {
                map.set(key, {
                    medicationId: item.medicationId,
                    items: [],
                    revenue: 0,
                    quantity: 0,
                });
            }

            const entry = map.get(key);

            entry.items.push({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                createdAt: purchase.createdAt,
            });

            entry.revenue += Number(item.unitPrice) * item.quantity;
            entry.quantity += item.quantity;
        }
    }

    return map;
}

function aggregateFromMap(map) {
    const result = [];

    for (const [, value] of map.entries()) {
        result.push({
            medicationId: value.medicationId,
            soldQuantity: value.quantity,
            revenue: value.revenue,
            items: value.items,
        });
    }

    return result;
}

function applyPeriod(items, from, to) {
    return items.filter(i => {
        const d = new Date(i.createdAt);

        if (from && d < new Date(from)) return false;
        if (to && d > new Date(to)) return false;

        return true;
    });
}

export async function getMedicationSalesService(
    pharmacyId,
    { page = 1, limit = 10, from, to }
) {
    console.log(`to = ${to} and from = ${from}`);
    const skip = (page - 1) * limit;
    const hasCustomRange = !!(from || to);

    // 1. ALL TIME (always)
    const allTimePurchases = await prisma.purchase.findMany({
        where: { pharmacyId },
        include: { items: true },
    });

    // 2. CUSTOM RANGE (optional)
    const customRangePurchases = hasCustomRange
        ? await prisma.purchase.findMany({
            where: {
                pharmacyId,
                createdAt: {
                    ...(from && { gte: new Date(from) }),
                    ...(to && { lte: new Date(to) }),
                },
            },
            include: { items: true },
        })
        : null;

    // 3. aggregate both
    const allTimeMap = aggregatePurchases(allTimePurchases);
    const customMap = hasCustomRange
        ? aggregatePurchases(customRangePurchases)
        : allTimeMap;

    // 4. get medications
    const medicationIds = [...allTimeMap.keys()].map(Number);

    const medications = await prisma.medication.findMany({
        where: { id: { in: medicationIds } },
        include: { category: true },
    });

    const inventory = await prisma.pharmacyInventory.findMany({
        where: {
            pharmacyId,
            medicationId: { in: medicationIds },
        },
    });

    // 5. build response
    const result = medications.map(med => {
        const allTime = allTimeMap.get(med.id.toString());
        const custom = customMap.get(med.id.toString());

        const inv = inventory.find(i => i.medicationId === med.id);

        const customItems = custom ? custom.items : [];

        const customAggregated = applyPeriod(
            customItems,
            from,
            to
        );

        let customRevenue = 0;
        let customQuantity = 0;

        for (const item of customAggregated) {
            customRevenue += Number(item.unitPrice) * item.quantity;
            customQuantity += item.quantity;
        }

        return {
            medicationId: med.id,
            brandName: med.brandName,
            genericName: med.genericName,
            categoryName: med.category.categoryName,

            stock: inv?.stock || 0,

            customRange: hasCustomRange
                ? {
                    soldQuantity: customQuantity,
                    revenue: customRevenue,
                }
                : {
                    soldQuantity: allTime.quantity,
                    revenue: allTime.revenue,
                },

            allTime: {
                soldQuantity: allTime.quantity,
                revenue: allTime.revenue,
            },
        };
    });

    // 6. pagination
    const paginated = result.slice(skip, skip + limit);

    return {
        recordsCount: result.length,
        page,
        limit,
        data: paginated,
    };
}