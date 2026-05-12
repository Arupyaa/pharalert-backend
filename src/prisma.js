import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

/** @type {PrismaClient} */
const globalForPrisma = globalThis;

const prisma =
    new PrismaClient({ adapter });

export default prisma;