import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/*
==================================================
SEED PHARMACY INVENTORY
==================================================

This script:

1. Loops through all pharmacies
2. Loops through all medications
3. Creates current inventory stock
4. Creates corresponding InventoryAdjustment
5. Simulates shortages by making 30% of medications
   start at only 20% of average stock
*/

/*
==================================================
MAIN FUNCTION
==================================================
*/

async function seedPharmacyInventory({
    averageAmountPerMedication = 100,
    createdAt = new Date(),
}) {

    console.log("Starting pharmacy inventory seed...");

    /*
    ==========================================
    GET ALL PHARMACIES + MEDICATIONS
    ==========================================
    */

    const pharmacies = await prisma.pharmacy.findMany({
        select: {
            id: true,
            name: true,
        },
    });

    const medications = await prisma.medication.findMany({
        select: {
            id: true,
            brandName: true,
        },
    });

    console.log(
        `Found ${pharmacies.length} pharmacies and ${medications.length} medications`
    );

    /*
    ==========================================
    LOOP THROUGH PHARMACIES
    ==========================================
    */

    for (const pharmacy of pharmacies) {

        console.log(`\nProcessing pharmacy: ${pharmacy.name}`);

        /*
        ==========================================
        RANDOMLY CHOOSE 30% LOW STOCK MEDICATIONS
        ==========================================
        */

        const lowStockMedicationIds = new Set();

        const lowStockCount = Math.floor(medications.length * 0.3);

        while (lowStockMedicationIds.size < lowStockCount) {

            const randomMedication =
                medications[Math.floor(Math.random() * medications.length)];

            lowStockMedicationIds.add(randomMedication.id.toString());
        }

        /*
        ==========================================
        LOOP THROUGH MEDICATIONS
        ==========================================
        */

        for (const medication of medications) {

            /*
            ==========================================
            DETERMINE STARTING QUANTITY
            ==========================================
            */

            let quantity;

            const isLowStock =
                lowStockMedicationIds.has(medication.id.toString());

            if (isLowStock) {

                // 20% of average stock
                quantity = Math.max(
                    1,
                    Math.floor(averageAmountPerMedication * 0.2)
                );

            } else {

                // Normal randomized stock around average
                quantity = randomBetween(
                    Math.floor(averageAmountPerMedication * 0.7),
                    Math.floor(averageAmountPerMedication * 1.3)
                );
            }

            /*
            ==========================================
            CREATE PHARMACY INVENTORY RECORD
            ==========================================
            */

            await prisma.pharmacyInventory.create({
                data: {
                    pharmacyId: pharmacy.id,
                    medicationId: medication.id,
                    stock:quantity,
                    createdAt,
                },
            });

            /*
            ==========================================
            CREATE OPENING STOCK INVENTORY ADJUSTMENT
            ==========================================
            */

            await prisma.inventoryAdjustment.create({
                data: {
                    pharmacyId: pharmacy.id,
                    medicationId: medication.id,
                    adjustmentType: "IN",
                    quantity,
                    reason: "OPENING_STOCK",
                    notes: "Initial inventory",
                    createdAt,
                },
            });

        }

        console.log(`Finished pharmacy: ${pharmacy.name}`);
    }

    console.log("\nPharmacy inventory seed completed.");
}

/*
==================================================
HELPERS
==================================================
*/

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
==================================================
RUN SCRIPT
==================================================
*/

seedPharmacyInventory({
    averageAmountPerMedication: 800,
    createdAt: new Date("2026-03-01T08:00:00Z"),
})
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });