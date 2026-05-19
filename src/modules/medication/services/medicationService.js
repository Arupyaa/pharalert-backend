import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

export const createMedicationService = async (data) => {
    const category = await prisma.medicationCategory.findUnique({
        where: { id: data.categoryId },
    });
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const company = await prisma.medicationCompany.findUnique({
        where: { id: data.companyId },
    });
    if (!company) {
        throw new AppError("Company not found", 404);
    }

    const medication = await prisma.medication.create({
        data: {
            brandName: data.brandName,
            genericName: data.genericName,
            categoryId: data.categoryId,
            companyId: data.companyId,
            unitPrice: data.unitPrice,
        },
        include: {
            category: true,
            company: {
                select: { companyName: true },
            },
        },
    });

    return medication;
};

export const getMedicationsService = async (query) => {
    const { search, categoryId, companyId } = query;

    const where = { deletedAt: null };

    if (search) {
        where.OR = [
            { brandName: { contains: search, mode: "insensitive" } },
            { genericName: { contains: search, mode: "insensitive" } },
        ];
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (companyId) {
        where.companyId = companyId;
    }

    const medications = await prisma.medication.findMany({
        where,
        select: {
            id: true,
            brandName: true,
            genericName: true,
            categoryId: true,
            unitPrice: true,
            category: {
                select: { categoryName: true },
            },
            company: {
                select: { companyName: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return medications;
};

export const getMedicationByIdService = async (id) => {
    const medication = await prisma.medication.findUnique({
        where: { id },
        select: {
            id: true,
            brandName: true,
            genericName: true,
            categoryId: true,
            unitPrice: true,
            category: {
                select: { categoryName: true },
            },
            company: {
                select: { companyName: true },
            },
        },
    });

    if (!medication || medication.deletedAt) {
        throw new AppError("Medication not found", 404);
    }

    return medication;
};

export const updateMedicationService = async (id, data) => {
    const existing = await prisma.medication.findUnique({
        where: { id },
    });

    if (!existing || existing.deletedAt) {
        throw new AppError("Medication not found", 404);
    }

    if (data.categoryId) {
        const category = await prisma.medicationCategory.findUnique({
            where: { id: data.categoryId },
        });
        if (!category) {
            throw new AppError("Category not found", 404);
        }
    }

    if (data.companyId) {
        const company = await prisma.medicationCompany.findUnique({
            where: { id: data.companyId },
        });
        if (!company) {
            throw new AppError("Company not found", 404);
        }
    }

    const medication = await prisma.medication.update({
        where: { id },
        data,
        include: {
            category: true,
            company: {
                select: { companyName: true },
            },
        },
    });

    return medication;
};

export const getInStockMedicationsService = async (query) => {
    const { search, categoryId, companyId } = query;

    const where = {
        deletedAt: null,
        pharmacyInventory: {
            some: {
                stock: { gt: 0 },
            },
        },
    };

    if (search) {
        where.OR = [
            { brandName: { contains: search, mode: "insensitive" } },
            { genericName: { contains: search, mode: "insensitive" } },
        ];
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (companyId) {
        where.companyId = companyId;
    }

    const medications = await prisma.medication.findMany({
        where,
        select: {
            id: true,
            brandName: true,
            genericName: true,
            categoryId: true,
            unitPrice: true,
            category: {
                select: { categoryName: true },
            },
            company: {
                select: { companyName: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return medications;
};

export const deleteMedicationService = async (id) => {
    const existing = await prisma.medication.findUnique({
        where: { id },
    });

    if (!existing || existing.deletedAt) {
        throw new AppError("Medication not found", 404);
    }

    const medication = await prisma.medication.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    return medication;
};
