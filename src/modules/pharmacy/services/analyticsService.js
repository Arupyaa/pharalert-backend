import prisma from "../../../prisma.js";

const LOW_STOCK_THRESHOLD = 30;

//analytics summary service

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

//analytics sales performance service

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

//analytics monthly profit service

export async function getMonthlyProfitService(
    pharmacyId,
    { year }
) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    const purchases = await prisma.purchase.findMany({
        where: {
            pharmacyId,

            createdAt: {
                gte: startDate,
                lt: endDate,
            },
        },

        select: {
            totalPrice: true,
            createdAt: true,
        },
    });

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const monthlyMap = new Map();

    months.forEach(month => {
        monthlyMap.set(month, {
            month,
            revenue: 0,
            salesCount: 0,
        });
    });

    for (const purchase of purchases) {
        const month =
            months[new Date(purchase.createdAt).getMonth()];

        const entry = monthlyMap.get(month);

        entry.revenue += Number(purchase.totalPrice);
        entry.salesCount += 1;
    }

    return [...monthlyMap.values()].map(item => ({
        ...item,
        revenue: Number(item.revenue.toFixed(2)),
    }));
}

//analytics top selling medications service

export async function getTopSellingMedicationsService(
    pharmacyId,
    { from, to, limit }
) {
    const dateFilter = buildDateFilter(from, to);

    const [overallItems, rangeItems] =
        await prisma.$transaction([

            prisma.purchaseItem.findMany({
                where: {
                    purchase: {
                        pharmacyId,
                    },
                },

                include: {
                    medication: {
                        include: {
                            category: true,
                        },
                    },

                    purchase: true,
                },
            }),

            prisma.purchaseItem.findMany({
                where: {
                    purchase: {
                        pharmacyId,
                        ...dateFilter,
                    },
                },

                include: {
                    medication: {
                        include: {
                            category: true,
                        },
                    },

                    purchase: true,
                },
            }),
        ]);

    const map = new Map();

    for (const item of overallItems) {
        const key = item.medicationId.toString();

        if (!map.has(key)) {
            map.set(key, {
                medicationId: item.medicationId,

                brandName:
                    item.medication.brandName,

                genericName:
                    item.medication.genericName,

                categoryName:
                    item.medication.category
                        .categoryName,

                overallRevenue: 0,
                overallQuantity: 0,

                customRangeRevenue: 0,
                customRangeQuantity: 0,
            });
        }

        const entry = map.get(key);

        entry.overallRevenue +=
            Number(item.unitPrice) *
            item.quantity;

        entry.overallQuantity += item.quantity;
    }

    for (const item of rangeItems) {
        const key = item.medicationId.toString();

        if (!map.has(key)) continue;

        const entry = map.get(key);

        entry.customRangeRevenue +=
            Number(item.unitPrice) *
            item.quantity;

        entry.customRangeQuantity += item.quantity;
    }

    const result = [...map.values()]
        .map(item => ({
            ...item,

            overallRevenue: Number(
                item.overallRevenue.toFixed(2)
            ),

            customRangeRevenue: Number(
                item.customRangeRevenue.toFixed(2)
            ),
        }))
        .sort(
            (a, b) =>
                b.customRangeRevenue -
                a.customRangeRevenue
        )
        .slice(0, limit);

    return result;
}

//customer activity analytics service

function formatDate(date) {
    return new Date(date)
        .toISOString()
        .split("T")[0];
}

export async function getCustomerActivityService(
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
            customerName: true,
            createdAt: true,
            totalPrice: true,
        },

        orderBy: {
            createdAt: "asc",
        },
    });

    const activityMap = new Map();

    for (const purchase of purchases) {
        const date = formatDate(
            purchase.createdAt
        );

        if (!activityMap.has(date)) {
            activityMap.set(date, {
                date,

                customersSet: new Set(),

                purchasesCount: 0,

                revenue: 0,
            });
        }

        const entry = activityMap.get(date);

        entry.customersSet.add(
            purchase.customerName
        );

        entry.purchasesCount += 1;

        entry.revenue += Number(
            purchase.totalPrice
        );
    }

    const chartData = [...activityMap.values()]
        .map(entry => ({
            date: entry.date,

            customersCount:
                entry.customersSet.size,

            purchasesCount:
                entry.purchasesCount,

            revenue: Number(
                entry.revenue.toFixed(2)
            ),
        }))
        .sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );

    const totalCustomers = new Set(
        purchases.map(p => p.customerName)
    ).size;

    const totalPurchases = purchases.length;

    const totalRevenue = Number(
        purchases
            .reduce(
                (sum, purchase) =>
                    sum +
                    Number(purchase.totalPrice),
                0
            )
            .toFixed(2)
    );

    //total customers assume unique customers but pharmacy logs customers who doesn't leave their name as customer resulting in incorrect customer amount
    return {
        // totalCustomers,
        // totalPurchases,
        // totalRevenue,

        chartData,
    };
}