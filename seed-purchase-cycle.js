import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { generateRealisticTimestamps, egyptDateToUtcRange, formatToLocalTimeZone, generateDailyRanges } from "./utils.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });



async function main() {
    await simulatePharmaciesOverPeriod({
        prisma,
        startDate: "2026-03-01T00:00:00z",
        endDate: "2026-03-07T23:59:59z",
        eventsPerDay: 60,
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

/* =========================================================
MULTI DAY SIMULATION
========================================================= */

async function simulatePharmaciesOverPeriod({
    prisma,
    startDate,
    endDate,
    eventsPerDay = 50,
    preferredMedicationId = null,
}) {
    console.log("Starting multi-day pharmacy simulation...");

    // =========================
    // FETCH ALL PHARMACIES ONCE
    // =========================
    const pharmacies = await prisma.pharmacy.findMany({
        select: { id: true },
    });

    // =========================
    // GENERATE DAILY RANGES
    // =========================
    const dailyRanges = generateDailyRanges(
        startDate,
        endDate
    );
    console.log(`daily ranges: ${dailyRanges}`)

    // =========================
    // ITERATE THROUGH EACH DAY
    // =========================
    for (const range of dailyRanges) {

        const dayStart = new Date(range.startDate);

        const dayEnd = new Date(range.endDate);

        console.log(dayStart);
        console.log(dayEnd);

        // =========================
        // GENERATE TIMESTAMPS FOR DAY
        // =========================
        const timestamps =
            generateRealisticTimestamps({
                startDate: range.startDate,
                endDate: range.endDate,
                count: eventsPerDay,
                minGapMinutes: 2,
            });

        console.log(
            `Simulating date: ${formatToLocalTimeZone(dayStart)}`
        );

        console.log(
            timestamps.map((time) =>
                formatToLocalTimeZone(time)
            )
        );

        // =========================
        // LOOP THROUGH PHARMACIES
        // =========================
        for (const pharmacy of pharmacies) {

            await simulatePharmacyDay({
                prisma,
                pharmacyId: pharmacy.id,
                timestamps,
                preferredMedicationId,
            });
        }
    }

    console.log("Multi-day simulation completed.");
}

/* =========================================================
SINGLE PHARMACY DAILY SIMULATION
========================================================= */

async function simulatePharmacyDay({
    prisma,
    pharmacyId,
    timestamps,
    preferredMedicationId = null,
}) {
    console.log(`Simulating pharmacy ${pharmacyId}`);

    const medications = await prisma.medication.findMany({
        select: { id: true, unitPrice: true },
    });

    const medicationIds = medications.map((m) => m.id);

    const egyptianNames = [
        "Ahmed Ali",
        "Mohamed Hassan",
        "Omar Khaled",
        "Youssef Mahmoud",
        "Mostafa Ibrahim",
        "Mahmoud Tarek",
        "Hassan Adel",
        "Karim Ashraf",
        "Tamer Nasser",
        "Sherif Samir",
    ];

    // =====================================================
    // ✅ INVENTORY CACHE (CRITICAL FIX)
    // =====================================================
    const inventoryCache = new Map();

    const getStock = async (medicationId) => {
        const key = `${pharmacyId}-${medicationId}`;

        if (inventoryCache.has(key)) {
            return inventoryCache.get(key);
        }

        const inventoryRecord = await prisma.pharmacyInventory.findFirst({
            where: { pharmacyId, medicationId },
        });

        const stock = inventoryRecord?.stock ?? 0;
        inventoryCache.set(key, stock);

        return stock;
    };

    const updateStock = (medicationId, newStock) => {
        const key = `${pharmacyId}-${medicationId}`;
        inventoryCache.set(key, newStock);
    };

    for (const timestamp of timestamps) {
        const inquiryCount = Math.floor(Math.random() * 4) + 1;

        const requestedMedications = [];

        for (let i = 0; i < inquiryCount; i++) {
            if (preferredMedicationId && Math.random() < 0.5) {
                requestedMedications.push(preferredMedicationId);
            } else {
                requestedMedications.push(
                    medicationIds[
                    Math.floor(Math.random() * medicationIds.length)
                    ]
                );
            }
        }

        const purchasedItems = [];

        const customerName =
            Math.random() < 0.2
                ? egyptianNames[
                Math.floor(Math.random() * egyptianNames.length)
                ]
                : "customer";

        for (const medicationId of requestedMedications) {
            const quantity = Math.floor(Math.random() * 4) + 1;

            // =====================================================
            // ✅ SAFE STOCK CHECK (NO STALE DB READS)
            // =====================================================
            const currentStock = await getStock(medicationId);

            let demandType = "NO_ACTION";

            if (currentStock > 0) {
                const usedQty = Math.min(quantity, currentStock);

                purchasedItems.push({
                    medicationId,
                    quantity: usedQty,
                });

                updateStock(medicationId, currentStock - usedQty);

                demandType = "PURCHASED";
            } else {
                const shouldTryReplacement = Math.random() < 0.5;

                if (shouldTryReplacement) {
                    const replacement =
                        await prisma.medicationReplacement.findFirst({
                            where: { medicationId },
                        });

                    if (replacement) {
                        const replacementStock = await getStock(
                            replacement.replacementMedicationId
                        );

                        if (replacementStock > 0) {
                            const refusalRate =
                                Math.random() * 0.4 + 0.3;

                            const isAccepted =
                                Math.random() > refusalRate;

                            await prisma.replacement.create({
                                data: {
                                    pharmacyId,
                                    medicationReplacementId: replacement.id,
                                    customerName,
                                    isAccepted,
                                    createdAt: timestamp,
                                },
                            });

                            if (isAccepted) {
                                const usedQty = Math.min(
                                    quantity,
                                    replacementStock
                                );

                                purchasedItems.push({
                                    medicationId:
                                        replacement.replacementMedicationId,
                                    quantity: usedQty,
                                });

                                updateStock(
                                    replacement.replacementMedicationId,
                                    replacementStock - usedQty
                                );

                                demandType = "REPLACEMENT_ACCEPTED";
                            } else {
                                demandType = "REPLACEMENT_REFUSED";
                            }
                        }
                    }
                }
            }

            await prisma.demandLog.create({
                data: {
                    pharmacyId,
                    medicationId,
                    demandType,
                    createdAt: timestamp,
                },
            });
        }

        const validPurchasedItems = purchasedItems.filter(
            (i) => i.quantity > 0
        );

        if (validPurchasedItems.length === 0) continue;

        const purchase = await prisma.purchase.create({
            data: {
                pharmacyId,
                customerName,
                totalPrice: 0,
                paymentStatus: "fully_paid",
                createdAt: timestamp,
            },
        });

        let totalPrice = 0;

        for (const item of validPurchasedItems) {
            const medication = await prisma.medication.findUnique({
                where: { id: item.medicationId },
            });

            if (!medication) continue;

            const basePrice = Number(medication.unitPrice);

            let discount = 0;

            if (Math.random() < 0.1) {
                const percent =
                    Math.random() * (0.15 - 0.05) + 0.05;
                discount = +(basePrice * percent).toFixed(2);
            }

            const finalUnitPrice = basePrice - discount;
            const finalTotalPrice = finalUnitPrice * item.quantity;

            await prisma.purchaseItem.create({
                data: {
                    purchaseId: purchase.id,
                    medicationId: item.medicationId,
                    quantity: item.quantity,
                    unitPrice: basePrice,
                    medicationDiscount: discount,
                    totalPrice: finalTotalPrice,
                },
            });

            totalPrice += finalTotalPrice;

            await prisma.pharmacyInventory.updateMany({
                where: {
                    pharmacyId,
                    medicationId: item.medicationId,
                },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                    updatedAt: timestamp,
                },
            });

            await prisma.inventoryAdjustment.create({
                data: {
                    pharmacyId,
                    medicationId: item.medicationId,
                    adjustmentType: "OUT",
                    quantity: item.quantity,
                    reason: "PURCHASE",
                    referencePurchaseId: purchase.id,
                    createdAt: timestamp,
                },
            });
        }

        await prisma.purchase.update({
            where: { id: purchase.id },
            data: { totalPrice },
        });
    }

    console.log(`Finished pharmacy simulation for ${pharmacyId}`);
}