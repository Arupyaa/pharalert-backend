import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//searches upwards until it finds .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../../.env")
});

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client.js"

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function getReceipts(pharmacyId,page,limit) {
    const res = await prisma.purchase.findMany({
        where: { pharmacyId: pharmacyId },
        include: {
            items: true
        },
        orderBy: {createdAt:"asc"}
    });
    return res;
}

export async function getReceiptsCount(pharmacyId) {
    const res = await prisma.purchase.count({
        where: {
            pharmacyId: pharmacyId
        }
    });
    return res;
}