// =====================================
// RESERVATIONS + STOCK ALERT SEEDER
// =====================================

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import dayjs from "dayjs";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// =====================================
// MAIN
// =====================================

async function main() {

    const seedDate = "2026-04-05T00:00:00Z";

    await seedReservations({
        prisma,
        date: seedDate,
    });

    await seedStockAlertSubscriptions({
        prisma,
        date: seedDate,
    });
}

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });

export default main;

// =====================================
// RANDOM HELPERS
// =====================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
    return array[
        Math.floor(Math.random() * array.length)
    ];
}

function randomDateBetween(start, end) {
    return new Date(
        start.getTime() +
        Math.random() *
        (end.getTime() - start.getTime())
    );
}

// =====================================
// STOCK HELPERS
// =====================================

async function findAllStockIN(date) {

    return prisma.inventoryAdjustment.groupBy({
        by: ["pharmacyId", "medicationId"],
        where: {
            adjustmentType: "IN",
            createdAt: {
                lte: date,
            },
        },
        _sum: {
            quantity: true,
        },
    });
}

async function findAllStockOUT(date) {

    return prisma.inventoryAdjustment.groupBy({
        by: ["pharmacyId", "medicationId"],
        where: {
            adjustmentType: "OUT",
            createdAt: {
                lte: date,
            },
        },
        _sum: {
            quantity: true,
        },
    });
}

// =====================================
// FIND STOCK BY MEDICATION
// =====================================

async function findAllStockByMedication(date) {

    const stockIN = await findAllStockIN(date);
    const stockOUT = await findAllStockOUT(date);

    const stockMap = new Map();

    // =========================
    // ADD IN
    // =========================

    for (const item of stockIN) {

        const key =
            `${item.pharmacyId}-${item.medicationId}`;

        stockMap.set(key, {
            pharmacyId: item.pharmacyId,
            medicationId: item.medicationId,
            stock: item._sum.quantity || 0,
        });
    }

    // =========================
    // SUBTRACT OUT
    // =========================

    for (const item of stockOUT) {

        const key =
            `${item.pharmacyId}-${item.medicationId}`;

        if (stockMap.has(key)) {

            stockMap.get(key).stock -=
                item._sum.quantity || 0;

        } else {

            stockMap.set(key, {
                pharmacyId: item.pharmacyId,
                medicationId: item.medicationId,
                stock: -(item._sum.quantity || 0),
            });
        }
    }

    // =========================
    // GROUP BY MEDICATION
    // =========================

    const medicationMap = new Map();

    for (const item of stockMap.values()) {

        if (!medicationMap.has(item.medicationId)) {

            medicationMap.set(
                item.medicationId,
                {
                    medicationId: item.medicationId,
                    pharmacies: [],
                }
            );
        }

        medicationMap
            .get(item.medicationId)
            .pharmacies
            .push({
                pharmacyId: item.pharmacyId,
                stock: item.stock,
            });
    }

    return Array.from(medicationMap.values());
}

// =====================================
// CREATE RESERVATIONS
// =====================================

async function seedReservations({
    prisma,
    date,
}) {

    console.log(
        "Starting reservations seed..."
    );

    let reservationCount = 0;

    const currentDate = new Date(date);

    // =========================
    // PREMIUM USERS
    // =========================

    const premiumUsers =
        await prisma.endUser.findMany({
            where: {
                accountType: "paid",
            },
            select: {
                id: true,
            },
        });

    // =========================
    // CURRENT STOCK SNAPSHOT
    // =========================

    const stock =
        await findAllStockByMedication(date);

    // =========================
    // ONLY AVAILABLE MEDICATIONS
    // =========================

    const availableMedicationIds =
        stock
            .filter((medication) =>
                medication.pharmacies.some(
                    (pharmacy) =>
                        pharmacy.stock > 0
                )
            )
            .map((medication) =>
                medication.medicationId
            );

    if (
        availableMedicationIds.length === 0
    ) {
        console.log(
            "No available medications found."
        );
        return;
    }

    // =========================
    // FETCH MEDICATIONS
    // =========================

    const medications =
        await prisma.medication.findMany({
            where: {
                id: {
                    in: availableMedicationIds,
                },
            },
            select: {
                id: true,
                unitPrice: true,
            },
        });

    // =========================
    // ONE RESERVATION PER USER
    // =========================

    for (const user of premiumUsers) {

        // =====================
        // RANDOM MEDICATION
        // =====================

        const medication =
            randomElement(medications);

        const quantity =
            randomInt(1, 2);

        const subtotal =
            Number(medication.unitPrice)
            * quantity;

        // =====================
        // CREATED AT
        // =====================

        const createdAt =
            randomDateBetween(
                dayjs(currentDate)
                    .subtract(3, "month")
                    .toDate(),
                currentDate
            );

        // =====================
        // DELIVERY DATE
        // =====================

        let deliveryDate;

        // 30% future
        if (Math.random() < 0.3) {

            const futureStart =
                dayjs(currentDate)
                    .add(1, "month")
                    .toDate();

            const futureEnd =
                dayjs(currentDate)
                    .add(2, "month")
                    .toDate();

            deliveryDate =
                randomDateBetween(
                    futureStart,
                    futureEnd
                );

        } else {

            const deliveredStart =
                dayjs(createdAt)
                    .add(3, "day")
                    .toDate();

            const deliveredEnd =
                currentDate;

            deliveryDate =
                randomDateBetween(
                    deliveredStart,
                    deliveredEnd
                );
        }

        // =====================
        // STATUS
        // =====================

        const status =
            deliveryDate > currentDate
                ? "pending"
                : "delivered";

        // =====================
        // CREATE RESERVATION
        // =====================

        await prisma.reservation.create({
            data: {
                userId: user.id,
                status,
                deliveryDate,
                totalPrice: subtotal,
                createdAt,

                items: {
                    create: [
                        {
                            medicationId:
                                medication.id,
                            quantity,
                            unitPrice:
                                medication.unitPrice,
                            subtotal,
                        },
                    ],
                },
            },
        });

        reservationCount++;
    }

    console.log(
        `Reservations created: ${reservationCount}`
    );
}

// =====================================
// CREATE STOCK ALERT SUBSCRIPTIONS
// =====================================

async function seedStockAlertSubscriptions({
    prisma,
    date,
}) {

    console.log(
        "Starting stock alert subscriptions seed..."
    );

    let subscriptionCount = 0;

    const currentDate = new Date(date);

    // =========================
    // PREMIUM USERS
    // =========================

    const premiumUsers =
        await prisma.endUser.findMany({
            where: {
                accountType: "paid",
            },
            select: {
                id: true,
            },
        });

    // =========================
    // PHARMACIES WITH REGIONS
    // =========================

    const pharmacies =
        await prisma.pharmacy.findMany({
            select: {
                id: true,
                regionId: true,
            },
        });

    const pharmacyRegionMap = new Map();
    const regionPharmaciesMap = new Map();

    for (const p of pharmacies) {
        pharmacyRegionMap.set(p.id, p.regionId);

        const rid = p.regionId.toString();
        if (!regionPharmaciesMap.has(rid)) {
            regionPharmaciesMap.set(rid, []);
        }
        regionPharmaciesMap.get(rid).push(p.id);
    }

    // =========================
    // STOCK SNAPSHOT
    // =========================

    const stock =
        await findAllStockByMedication(date);

    // Build medication -> pharmacyId -> stock map
    const medicationStockMap = new Map();

    for (const med of stock) {
        const pharmacyMap = new Map();
        for (const p of med.pharmacies) {
            pharmacyMap.set(p.pharmacyId, p.stock);
        }
        medicationStockMap.set(
            med.medicationId.toString(),
            pharmacyMap
        );
    }

    // =========================
    // PER-REGION & PER-PHARMACY
    // OUT OF STOCK
    // =========================

    const medOutOfStockRegions = new Map();
    const medOutOfStockPharmacies = new Map();

    for (const med of stock) {
        const medId = med.medicationId.toString();
        const regions = [];
        const outOfStockPharmacies = [];

        // Per-region: all region pharmacies have 0 stock
        for (const [rid, pharmacyIds] of regionPharmaciesMap) {
            const allOut = pharmacyIds.every((pid) => {
                const pharmacyMap =
                    medicationStockMap.get(medId);
                if (!pharmacyMap) return true;
                const s = pharmacyMap.get(pid);
                return s === undefined || s <= 0;
            });
            if (allOut) {
                regions.push(BigInt(rid));
            }
        }

        // Per-pharmacy: stock <= 0
        for (const p of med.pharmacies) {
            if (p.stock <= 0) {
                outOfStockPharmacies.push(p.pharmacyId);
            }
        }

        if (regions.length > 0) {
            medOutOfStockRegions.set(
                med.medicationId,
                regions
            );
        }
        if (outOfStockPharmacies.length > 0) {
            medOutOfStockPharmacies.set(
                med.medicationId,
                outOfStockPharmacies
            );
        }
    }

    if (
        medOutOfStockRegions.size === 0 &&
        medOutOfStockPharmacies.size === 0
    ) {
        console.log(
            "No out of stock medications found for any region or pharmacy."
        );
        return;
    }

    // =========================
    // 30% OF PREMIUM USERS
    // =========================

    for (const user of premiumUsers) {

        if (Math.random() > 0.3) {
            continue;
        }

        const useRegion =
            medOutOfStockRegions.size > 0 &&
            (medOutOfStockPharmacies.size === 0 ||
                Math.random() < 0.5);

        let medicationId;
        let regionId = null;
        let pharmacyId = null;

        if (useRegion) {
            const medIds = Array.from(
                medOutOfStockRegions.keys()
            );
            medicationId = randomElement(medIds);
            regionId = randomElement(
                medOutOfStockRegions.get(medicationId)
            );
        } else {
            const medIds = Array.from(
                medOutOfStockPharmacies.keys()
            );
            medicationId = randomElement(medIds);
            pharmacyId = randomElement(
                medOutOfStockPharmacies.get(medicationId)
            );
        }

        const createdAt =
            randomDateBetween(
                dayjs(currentDate)
                    .subtract(2, "month")
                    .toDate(),
                currentDate
            );

        await prisma.stockAlertSubscription.create({
            data: {
                userId: user.id,
                medicationId,
                regionId,
                pharmacyId,
                createdAt,
                notifiedAt: null,
                isActive: true,
            },
        });

        subscriptionCount++;
    }

    console.log(
        `Stock alert subscriptions created: ${subscriptionCount}`
    );
}