import jwt from "jsonwebtoken";
import prisma from "../../../prisma.js"
import AppError from "../../../utils/AppError.js"
import generateAccessToken from "../../../utils/generateAccessToken.js";

const SUBSCRIPTION_FK_MAP = {
    ADMIN: null,
    PHARMACY: { fkField: "pharmacyId", model: "pharmacy", statusField: "accountStatus", expiredValue: "inactive" },
    COMPANY: { fkField: "companyId", model: "medicationCompany", statusField: "accountStatus", expiredValue: "inactive" },
    FREE_USER: { fkField: "userId", model: "endUser", statusField: "accountType", expiredValue: "free" },
    PAID_USER: { fkField: "userId", model: "endUser", statusField: "accountType", expiredValue: "free" },
};

async function fetchAccount(accountType, id) {
    switch (accountType) {
        case "ADMIN":
            return prisma.admin.findUnique({ where: { id } });
        case "PHARMACY":
            return prisma.pharmacy.findUnique({ where: { id }, include: { subscriptions: true } });
        case "COMPANY":
            return prisma.medicationCompany.findUnique({ where: { id }, include: { subscriptions: true } });
        case "FREE_USER":
        case "PAID_USER":
            return prisma.endUser.findUnique({ where: { id }, include: { subscriptions: true } });
        default:
            return null;
    }
}

export async function refreshService(refreshToken) {
    if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });

    if (!storedToken) {
        throw new AppError("Refresh token not found", 404);
    }

    const account = await fetchAccount(decoded.accountType, decoded.id);

    if (!account) {
        throw new AppError("Account not found", 404);
    }

    let accountStatus;
    let effectiveAccountType = decoded.accountType;

    if (decoded.accountType !== "ADMIN") {
        const subConfig = SUBSCRIPTION_FK_MAP[decoded.accountType];
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
                effectiveAccountType = account.accountType === "paid" ? "PAID_USER" : "FREE_USER";
            }
        } else if (latestSub && new Date(latestSub.endDate) > new Date() && account[subConfig.statusField] === subConfig.expiredValue) {
            const activeValue = subConfig.statusField === "accountType" ? "paid" : "active";

            await prisma[subConfig.model].update({
                where: { id: account.id },
                data: { [subConfig.statusField]: activeValue },
            });

            account[subConfig.statusField] = activeValue;

            if (subConfig.statusField === "accountType") {
                effectiveAccountType = account.accountType === "paid" ? "PAID_USER" : "FREE_USER";
            }
        }

        if (subConfig.statusField === "accountType") {
            effectiveAccountType = account.accountType === "paid" ? "PAID_USER" : "FREE_USER";
        }

        accountStatus = effectiveAccountType === "FREE_USER" || effectiveAccountType === "PAID_USER"
            ? account.accountType
            : account.accountStatus;
    }

    const accessToken = generateAccessToken({
        id: decoded.id,
        accountType: effectiveAccountType,
        accountStatus,
    });

    return { accessToken, accountStatus };
}
