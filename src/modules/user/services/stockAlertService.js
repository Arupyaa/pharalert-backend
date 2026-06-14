import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";
import { sendStockAlertEmail } from "../../../services/emailService.js";

export async function getOutOfStockService(pharmacyId, regionId) {
    if (pharmacyId) {
        const inventory = await prisma.pharmacyInventory.findMany({
            where: { pharmacyId, stock: 0 },
            include: {
                medication: {
                    select: { brandName: true, genericName: true },
                },
            },
        });

        return inventory.map((i) => ({
            medicationId: Number(i.medicationId),
            brandName: i.medication.brandName,
            genericName: i.medication.genericName,
        }));
    }

    if (regionId) {
        const pharmacies = await prisma.pharmacy.findMany({
            where: { regionId },
            select: { id: true },
        });

        if (pharmacies.length === 0) return [];

        const pharmacyIds = pharmacies.map((p) => p.id);

        const totalCount = pharmacyIds.length;

        const result = await prisma.pharmacyInventory.groupBy({
            by: ["medicationId"],
            where: {
                pharmacyId: { in: pharmacyIds },
                stock: 0,
            },
            _count: { medicationId: true },
        });

        const fullyOutOfStock = result.filter(
            (r) => r._count.medicationId === totalCount
        );

        if (fullyOutOfStock.length === 0) return [];

        const medicationIds = fullyOutOfStock.map((r) => r.medicationId);

        const medications = await prisma.medication.findMany({
            where: { id: { in: medicationIds } },
            select: { id: true, brandName: true, genericName: true },
        });

        return medications.map((m) => ({
            medicationId: Number(m.id),
            brandName: m.brandName,
            genericName: m.genericName,
        }));
    }

    return [];
}

export async function subscribeAlertService(userId, medicationId, pharmacyId, regionId) {
    if (pharmacyId) {
        const inventory = await prisma.pharmacyInventory.findFirst({
            where: { pharmacyId, medicationId },
        });

        if (inventory && inventory.stock > 0) {
            throw new AppError("Medication is already in stock at this pharmacy", 400);
        }

        const existing = await prisma.stockAlertSubscription.findUnique({
            where: {
                userId_medicationId_pharmacyId: { userId, medicationId, pharmacyId },
            },
        });

        if (existing) {
            const updated = await prisma.stockAlertSubscription.update({
                where: { id: existing.id },
                data: { isActive: true, notifiedAt: null },
            });
            return updated;
        }

        const subscription = await prisma.stockAlertSubscription.create({
            data: { userId, medicationId, pharmacyId },
        });

        return subscription;
    }

    if (regionId) {
        const pharmacies = await prisma.pharmacy.findMany({
            where: { regionId },
            select: { id: true },
        });

        const inStock = await prisma.pharmacyInventory.findFirst({
            where: {
                pharmacyId: { in: pharmacies.map((p) => p.id) },
                medicationId,
                stock: { gt: 0 },
            },
        });

        if (inStock) {
            throw new AppError("Medication is already in stock in your region", 400);
        }

        const existing = await prisma.stockAlertSubscription.findUnique({
            where: {
                userId_medicationId_regionId: { userId, medicationId, regionId },
            },
        });

        if (existing) {
            const updated = await prisma.stockAlertSubscription.update({
                where: { id: existing.id },
                data: { isActive: true, notifiedAt: null },
            });
            return updated;
        }

        const subscription = await prisma.stockAlertSubscription.create({
            data: { userId, medicationId, regionId },
        });

        return subscription;
    }

    throw new AppError("Either pharmacyId or regionId is required", 400);
}

export async function unsubscribeAlertService(alertId, userId) {
    const alert = await prisma.stockAlertSubscription.findFirst({
        where: { id: alertId, userId },
    });

    if (!alert) throw new AppError("Alert not found", 404);

    await prisma.stockAlertSubscription.delete({
        where: { id: alertId },
    });
}

export async function getUserAlertsService(userId) {
    const alerts = await prisma.stockAlertSubscription.findMany({
        where: { userId },
        include: {
            medication: {
                select: { brandName: true, genericName: true },
            },
            pharmacy: {
                select: { name: true },
            },
            region: {
                select: { name: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return alerts.map((a) => ({
        id: a.id,
        medicationId: Number(a.medicationId),
        brandName: a.medication.brandName,
        genericName: a.medication.genericName,
        pharmacyName: a.pharmacy?.name || null,
        regionName: a.region?.name || null,
        isActive: a.isActive,
        notifiedAt: a.notifiedAt,
        createdAt: a.createdAt,
    }));
}

export async function checkAndNotifyStockAlert(pharmacyId, medicationId) {
    const medication = await prisma.medication.findUnique({
        where: { id: medicationId },
        select: { brandName: true, genericName: true },
    });

    if (!medication) return;

    const medicationName = `${medication.brandName} (${medication.genericName})`;

    const pharmacy = await prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
        select: { id: true, name: true, regionId: true },
    });

    if (!pharmacy) return;

    const subscriptions = await prisma.stockAlertSubscription.findMany({
        where: {
            isActive: true,
            notifiedAt: null,
            OR: [
                { pharmacyId, medicationId },
                { regionId: pharmacy.regionId, medicationId },
            ],
        },
        include: {
            user: { select: { email: true } },
        },
    });

    for (const sub of subscriptions) {
        const isRegionAlert = sub.pharmacyId !== pharmacyId;

        await sendStockAlertEmail(
            sub.user.email,
            medicationName,
            { id: pharmacy.id, name: pharmacy.name },
            isRegionAlert
        );

        await prisma.stockAlertSubscription.update({
            where: { id: sub.id },
            data: { isActive: false, notifiedAt: new Date() },
        });
    }
}
