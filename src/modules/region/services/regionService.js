import prisma from "../../../prisma.js";

export const getRegionsService = async () => {
    return await prisma.region.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
};
