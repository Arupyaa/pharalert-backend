import prisma from "../../../prisma.js";

export async function getAllMedicationsService(search, region, page, limit) {
    const skip = (page - 1) * limit;

    const where = {
        pharmacy: {
            accountStatus: "active",
        },
    };

    if (search) {
        where.medication = {
            OR: [
                { brandName: { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
            ],
        };
    }

    if (region) {
        where.pharmacy.regionId = region;
    }

    const [inventory, totalRecords] = await Promise.all([
        prisma.pharmacyInventory.findMany({
            where,
            include: {
                pharmacy: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                        region: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                medication: {
                    select: {
                        id: true,
                        brandName: true,
                        genericName: true,
                        unitPrice: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.pharmacyInventory.count({ where }),
    ]);

    return { inventory, totalRecords };
}
