import prisma from "../../../prisma.js";

const LOW_STOCK_THRESHOLD = 30;

function buildDateFilter(from, to) {
    if (!from && !to) return {};

    return {
        createdAt: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
        },
    };
}

export async function getAnalyticsSummaryService(
    pharmacyId,
    { from, to }
) {
    const dateFilter = buildDateFilter(from, to);

    const [
        purchases,
        criticalInventoryCount,
        outOfStockCount,
        inStockCount,
    ] = await prisma.$transaction([
        prisma.purchase.findMany({
            where: {
                pharmacyId,
                ...dateFilter,
            },
            select: {
                customerName: true,
                totalPrice: true,
            },
        }),

        prisma.pharmacyInventory.count({
            where: {
                pharmacyId,
                stock: {
                    gt: 0,
                    lte: LOW_STOCK_THRESHOLD,
                },
            },
        }),

        prisma.pharmacyInventory.count({
            where: {
                pharmacyId,
                stock: 0,
            },
        }),

        prisma.pharmacyInventory.count({
            where: {
                pharmacyId,
                stock: {
                    gt: LOW_STOCK_THRESHOLD,
                },
            },
        }),
    ]);

    const customersCount = purchases.length;

    const totalSalesRevenue = purchases.reduce(
        (sum, purchase) =>
            sum + Number(purchase.totalPrice),
        0
    );

    const averageSale =
        purchases.length === 0
            ? 0
            : Number(
                (totalSalesRevenue / purchases.length).toFixed(2)
            );

    return {
        customersCount,
        salesRevenue: Number(totalSalesRevenue.toFixed(2)),
        averageSale,

        inventoryStatus: {
            inStock: inStockCount,
            criticalStock: criticalInventoryCount,
            outOfStock: outOfStockCount,
        },
    };
}

////////////////////////////////////////////////////////////////

function groupRevenueByDate(purchases) {
    const map = new Map();

    for (const purchase of purchases) {
        const date = purchase.createdAt
            .toISOString()
            .split("T")[0];

        if (!map.has(date)) {
            map.set(date, {
                date,
                revenue: 0,
                salesCount: 0,
            });
        }

        const entry = map.get(date);

        entry.revenue += Number(purchase.totalPrice);
        entry.salesCount += 1;
    }
    

    return [...map.values()].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );
}

export async function getSalesPerformanceService(
    pharmacyId,
    { from, to }
) {
    const dateFilter = buildDateFilter(from, to);

    const purchases = await prisma.purchase.findMany({
        where: {
            pharmacyId,
            ...dateFilter,
        },

        select: {
            totalPrice: true,
            createdAt: true,
        },

        orderBy: {
            createdAt: "asc",
        },
    });

    const totalSalesRevenue = purchases.reduce(
        (sum, purchase) =>
            sum + Number(purchase.totalPrice),
        0
    );

    const averageSale =
        purchases.length === 0
            ? 0
            : Number(
                (
                    totalSalesRevenue / purchases.length
                ).toFixed(2)
            );

    const chartData = groupRevenueByDate(purchases);

    return {
        totalSalesRevenue: Number(totalSalesRevenue.toFixed(2)),
        averageSale: Number(averageSale.toFixed(2)),
        salesCount: purchases.length,
        chartData,
    };
}