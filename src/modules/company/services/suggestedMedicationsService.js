import prisma from "../../../prisma.js";

export async function getMySuggestedMedicationsService(companyId) {
    const suggestions = await prisma.companySuggestedMedication.findMany({
        where: { companyId },
        include: {
            medication: {
                select: {
                    id: true,
                    brandName: true,
                    genericName: true,
                    manufacturingCompany: true,
                    unitPrice: true,
                    category: {
                        select: { categoryName: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return suggestions;
}
