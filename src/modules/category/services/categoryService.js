import prisma from "../../../prisma.js";

export const getCategoriesService = async () => {
    return await prisma.medicationCategory.findMany({
        select: { id: true, categoryName: true },
        orderBy: { categoryName: "asc" },
    });
};

export const createCategoryService = async (categoryName) => {
    return await prisma.medicationCategory.create({
        data: { categoryName },
    });
};
