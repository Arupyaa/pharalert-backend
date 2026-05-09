import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

//this seed file: adds medicationReplacements and subscription plans
//right now it's using date.now() for date but might need date customization later if needed



async function main() {
    // ... your previous seed logic

    await seedSubscriptions(prisma);
    await seedMedicationReplacements(prisma);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });






//seeder functions:

//subscription seed:
/*
startDate = now
endDate = +1 year
*/

async function seedSubscriptions(prisma) {
    console.log("Seeding subscriptions...");

    // USERS (paid only)
    const paidUsers = await prisma.endUser.findMany({
        where: { accountType: "paid" },
        select: { id: true },
    });

    const userSubs = paidUsers.map((user) => ({
        userId: user.id,
        pharmacyId: null,
        companyId: null,
        planName: "User_plan",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }));

    // PHARMACIES
    const pharmacies = await prisma.pharmacy.findMany({
        select: { id: true },
    });

    const pharmacySubs = pharmacies.map((pharmacy) => ({
        userId: null,
        pharmacyId: pharmacy.id,
        companyId: null,
        planName: "Pharmacy_Plan",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }));

    // COMPANIES
    const companies = await prisma.medicationCompany.findMany({
        select: { id: true },
    });

    const companySubs = companies.map((company) => ({
        userId: null,
        pharmacyId: null,
        companyId: company.id,
        planName: "Company_Plan",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }));

    await prisma.subscription.createMany({
        data: [...userSubs, ...pharmacySubs, ...companySubs],
    });

    console.log("Subscriptions seeded.");
}

//medication replacement seeder

/*
What it does
Groups medications by categoryId
For each medication:
picks another medication from same category

A → B
B → A
might need bidirectional deduping later
Avoids:
self-replacement
empty categories


*/


async function seedMedicationReplacements(prisma) {
    console.log("Seeding medication replacements...");

    const medications = await prisma.medication.findMany({
        select: {
            id: true,
            categoryId: true,
        },
    });

    // group by category
    const categoryMap = new Map();

    for (const med of medications) {
        if (!categoryMap.has(med.categoryId)) {
            categoryMap.set(med.categoryId, []);
        }
        categoryMap.get(med.categoryId).push(med.id);
    }

    const replacements = [];

    for (const med of medications) {
        const sameCategory = categoryMap.get(med.categoryId);

        if (!sameCategory || sameCategory.length < 2) continue;

        // pick random different medication
        let replacementId;
        do {
            replacementId =
                sameCategory[Math.floor(Math.random() * sameCategory.length)];
        } while (replacementId === med.id);

        replacements.push({
            medicationId: med.id,
            replacementMedicationId: replacementId,
        });
    }

    await prisma.medicationReplacement.createMany({
        data: replacements,
    });

    console.log("Medication replacements seeded.");
}