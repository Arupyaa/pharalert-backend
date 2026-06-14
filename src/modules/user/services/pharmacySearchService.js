import prisma from "../../../prisma.js";

const toRad = (deg) => (deg * Math.PI) / 180;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
};

export const listPharmaciesService = async () => {
    const pharmacies = await prisma.pharmacy.findMany({
        where: {
            accountStatus: "active",
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            region: {
                select: { name: true },
            },
        },
        orderBy: { name: "asc" },
    });

    return pharmacies.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        region: p.region.name,
    }));
};

export const searchPharmaciesService = async ({
    latitude,
    longitude,
    medicationIds,
    page,
    limit,
    radiusKm,
}) => {
    const groups = await prisma.pharmacyInventory.groupBy({
        by: ["pharmacyId"],
        where: {
            medicationId: { in: medicationIds },
            stock: { gt: 0 },
            pharmacy: { accountStatus: "active" },
        },
        _count: { medicationId: true },
        having: { medicationId: { _count: { equals: medicationIds.length } } },
    });

    const pharmacyIds = groups.map((g) => g.pharmacyId);
    if (pharmacyIds.length === 0) {
        return { recordsCount: 0, page, limit, data: [] };
    }

    const pharmacies = await prisma.pharmacy.findMany({
        where: { id: { in: pharmacyIds } },
        include: {
            region: true,
            inventory: {
                where: { medicationId: { in: medicationIds }, stock: { gt: 0 } },
                include: { medication: true },
            },
        },
    });

    const withDistance = pharmacies.map((p) => ({
        pharmacyId: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        openingHour: p.openingHour,
        closingHour: p.closingHour,
        currentStatus: p.currentStatus,
        address: p.address,
        region: p.region.name,
        distanceKm: calculateDistance(latitude, longitude, p.latitude, p.longitude),
        medications: p.inventory.map((inv) => ({
            medicationId: inv.medicationId,
            brandName: inv.medication.brandName,
            genericName: inv.medication.genericName,
            stock: inv.stock,
            unitPrice: inv.medication.unitPrice,
        })),
    }));

    const filtered = withDistance.filter((p) => p.distanceKm <= radiusKm);
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    const recordsCount = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedData = filtered.slice(offset, offset + limit);

    return { recordsCount, page, limit, data: paginatedData };
};
