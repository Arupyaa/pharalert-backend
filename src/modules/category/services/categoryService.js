import prisma from "../../../prisma.js";

export const getCategoriesService = async () => {
    return await prisma.medicationCategory.findMany({
        select: { id: true, categoryName: true },
        orderBy: { categoryName: "asc" },
    });
};
