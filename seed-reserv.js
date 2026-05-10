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

    const seedDate = "2026-04-27T00:00:00Z";

    // await seedReservations({
    //     prisma,
    //     date: seedDate,
    // });

    await seedStockAlertSubscriptions({
        prisma,
        date: seedDate,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

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
    // STOCK SNAPSHOT
    // =========================

    const stock =
        await findAllStockByMedication(date);

    // =========================
    // OUT OF STOCK IN ALL PHARMACIES
    // =========================

    const outOfStockMedicationIds =
        stock
            .filter((medication) =>
                medication.pharmacies.every(
                    (pharmacy) =>
                        pharmacy.stock <= 0
                )
            )
            .map((medication) =>
                medication.medicationId
            );

    if (
        outOfStockMedicationIds.length === 0
    ) {
        console.log(
            "No globally out of stock medications found."
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

        const medicationId =
            randomElement(
                outOfStockMedicationIds
            );

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