import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

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

    return { ...account, accountType };
}
