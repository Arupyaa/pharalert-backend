import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const SUBSCRIPTION_FK_MAP = {
    PHARMACY: { fkField: "pharmacyId", model: "pharmacy", statusField: "accountStatus", expiredValue: "inactive" },
    COMPANY: { fkField: "companyId", model: "medicationCompany", statusField: "accountStatus", expiredValue: "inactive" },
    FREE_USER: { fkField: "userId", model: "endUser", statusField: "accountType", expiredValue: "free" },
    PAID_USER: { fkField: "userId", model: "endUser", statusField: "accountType", expiredValue: "free" },
};

export async function identifyService(userId, accountType) {
    let account;

    switch (accountType) {
        case "ADMIN":
            account = await prisma.admin.findUnique({
                where: { id: userId },
            });
            if (account) {
                const { passwordHash, ...rest } = account;
                account = rest;
            }
            break;

        case "PHARMACY":
            account = await prisma.pharmacy.findUnique({
                where: { id: userId },
                include: { subscriptions: true },
            });
            if (account) {
                const { passwordHash, ...rest } = account;
                account = rest;
            }
            break;

        case "COMPANY":
            account = await prisma.medicationCompany.findUnique({
                where: { id: userId },
                include: { subscriptions: true },
            });
            if (account) {
                const { passwordHash, ...rest } = account;
                account = rest;
            }
            break;

        case "FREE_USER":
        case "PAID_USER":
            account = await prisma.endUser.findUnique({
                where: { id: userId },
                include: { subscriptions: true },
            });
            if (account) {
                const { passwordHash, ...rest } = account;
                account = rest;
            }
            break;

        default:
            throw new AppError("Unauthorized", 401);
    }

    if (!account) {
        throw new AppError("Account not found", 404);
    }

    if (accountType !== "ADMIN") {
        const subConfig = SUBSCRIPTION_FK_MAP[accountType];
        const latestSub = account.subscriptions?.length
            ? account.subscriptions.reduce((latest, sub) =>
                new Date(sub.endDate) > new Date(latest.endDate) ? sub : latest
              )
            : null;

        if (latestSub && new Date(latestSub.endDate) < new Date()) {
            await prisma[subConfig.model].update({
                where: { id: account.id },
                data: { [subConfig.statusField]: subConfig.expiredValue },
            });

            account[subConfig.statusField] = subConfig.expiredValue;

            if (subConfig.statusField === "accountType") {
                accountType = account.accountType === "paid" ? "PAID_USER" : "FREE_USER";
            }
        } else if (latestSub && new Date(latestSub.endDate) > new Date() && account[subConfig.statusField] === subConfig.expiredValue) {
            const activeValue = subConfig.statusField === "accountType" ? "paid" : "active";

            await prisma[subConfig.model].update({
                where: { id: account.id },
                data: { [subConfig.statusField]: activeValue },
            });

            account[subConfig.statusField] = activeValue;

            if (subConfig.statusField === "accountType") {
                accountType = account.accountType === "paid" ? "PAID_USER" : "FREE_USER";
            }
        }

        if (subConfig.statusField === "accountType") {
            accountType = account.accountType === "paid" ? "PAID_USER" : "FREE_USER";
        }
    }

    const accountStatus = accountType === "ADMIN" ? null
        : (accountType === "FREE_USER" || accountType === "PAID_USER") ? account.accountType
        : account.accountStatus;

    return { ...account, accountType, accountStatus };
}
