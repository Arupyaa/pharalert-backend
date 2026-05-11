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
import { PrismaClient } from "../../../../generated/prisma/client.js"

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function getReceipts(pharmacyId, order = "asc") {
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

export async function getReceiptsPaginated(pharmacyId, order = "asc", page, limit) {
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


