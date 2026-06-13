import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const PLANS = {
    PHARMACY: { planName: "pharmacy", price: 500, fkField: "pharmacyId" },
    COMPANY: { planName: "company", price: 2000, fkField: "companyId" },
    FREE_USER: { planName: "user", price: 200, fkField: "userId" },
    PAID_USER: { planName: "user", price: 200, fkField: "userId" },
};

const MODEL_MAP = {
    PHARMACY: "pharmacy",
    COMPANY: "medicationCompany",
    FREE_USER: "endUser",
    PAID_USER: "endUser",
};

function getFkField(accountType) {
    const plan = PLANS[accountType];
    if (!plan) throw new AppError("No subscription plan available for your account type", 400);
    return plan;
}

export async function purchaseSubscriptionService(userId, accountType, paymentMethod) {
    const { planName, price, fkField } = getFkField(accountType);

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
            data: {
                planName,
                startDate: now,
                endDate,
                [fkField]: userId,
            },
        });

        await tx.payment.create({
            data: {
                paymentAmount: price,
                paymentMethod,
                paymentDate: now,
            },
        });

        const model = MODEL_MAP[accountType];
        if (accountType === "PHARMACY" || accountType === "COMPANY") {
            await tx[model].update({
                where: { id: userId },
                data: { accountStatus: "active" },
            });
        }

        if (accountType === "FREE_USER") {
            await tx.endUser.update({
                where: { id: userId },
                data: { accountType: "paid" },
            });
        }

        if (accountType === "COMPANY") {
            const suggestions = await tx.companySuggestedMedication.findMany({
                where: { companyId: userId },
            });

            if (suggestions.length > 0) {
                const medicationIds = suggestions.map((s) => s.medicationId);
                await tx.medication.updateMany({
                    where: { id: { in: medicationIds } },
                    data: { companyId: userId },
                });
            }
        }

        return sub;
    });

    return subscription;
}

export async function getUserSubscriptionsService(userId, accountType) {
    const { fkField } = getFkField(accountType);

    const subscriptions = await prisma.subscription.findMany({
        where: { [fkField]: userId },
        orderBy: { createdAt: "desc" },
    });

    return subscriptions;
}
