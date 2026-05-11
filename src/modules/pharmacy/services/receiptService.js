import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//searches upwards until it finds .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../../../.env")
});

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../../../generated/prisma/client.js"


const connectionString = `${process.env.DATABASE_URL}`;
//local database adapter
const adapter = new PrismaPg({ connectionString });
//neon server adapter
// const adapter = new PrismaNeon({connectionString});
const prisma = new PrismaClient({ adapter });

export async function queryReceipts(pharmacyId, order = "asc") {
    const [receipts, count] = await prisma.$transaction([
        prisma.purchase.findMany({
            where: { pharmacyId: pharmacyId },
            include: {
                items: true
            },
            orderBy: { createdAt: order }
        }),
        prisma.purchase.count({
            where: {
                pharmacyId: pharmacyId
            }
        })
    ]);

    return {
        data: receipts,
        recordsCount: count
    }
}

export async function queryReceiptsPaginated(pharmacyId, order = "asc", page = 1, limit = 1) {
    const [receipts, count] = await prisma.$transaction([
        prisma.purchase.findMany({
            take: limit,
            skip: ((page - 1) * limit),
            where: { pharmacyId: pharmacyId },
            include: {
                items: true
            },
            orderBy: { createdAt: order }
        }),
        prisma.purchase.count({
            where: {
                pharmacyId: pharmacyId
            }
        })

    ])
    return {
        data: receipts,
        page: page,
        limit: limit,
        recordsCount: count
    }
}

// export async function queryReceiptsCount(pharmacyId) {
//     const count = await prisma.purchase.count({
//         where: {
//             pharmacyId: pharmacyId
//         }
//     });
//     return { recordsCount: count };
// }

export async function queryReceiptById(pharmacyId, receiptId) {
    const receipt = await prisma.purchase.findFirst({
        where: {
            AND: [
                { pharmacyId: pharmacyId },
                { id: receiptId }
            ]
        },
        include: {
            items: true
        }
    });
    return {
        data: receipt
    };
}

export async function queryReceiptBymedicationIncluded(pharmacyId, medicationId, order = "asc", page = 1, limit = 1) {
    const [receipts, count] = await prisma.$transaction([
        prisma.purchase.findMany({
            take: limit,
            skip: ((page - 1) * limit),
            where: {
                AND: [
                    { pharmacyId: pharmacyId },
                    {
                        items: {
                            some: {
                                medicationId: medicationId
                            }
                        }
                    }
                ]
            },
            orderBy: { createdAt: order },
            include: {
                items: true
            }
        }),
        prisma.purchase.count({
            where: {
                AND: [
                    { pharmacyId: pharmacyId },
                    {
                        items: {
                            some: {
                                medicationId: medicationId
                            }
                        }
                    }
                ]
            }
        })
    ]);

    return {
        data: receipts,
        page: page,
        limit: limit,
        recordsCount: count
    }
}