import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

async function countRecords(model, where) {
    return prisma[model].count({ where });
}

const subscriptionInclude = {
    subscriptions: {
        select: {
            id: true,
            planName: true,
            startDate: true,
            endDate: true,
            createdAt: true,
        },
    },
};

async function fetchAndMap(model, where, accountTypeLabel, include = {}) {
    const accounts = await prisma[model].findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
    });
    return accounts.map(a => {
        const { passwordHash, ...rest } = a;
        return { ...rest, accountType: accountTypeLabel };
    });
}

export async function getAllAccountsService(accountType, accountStatus, page, limit) {
    const skip = (page - 1) * limit;

    if (accountType) {
        return getAccountsByType(accountType, accountStatus, skip, limit);
    }

    const countWherePharmacy = accountStatus ? { accountStatus } : {};
    const countWhereCompany = accountStatus ? { accountStatus } : {};

    const countPromises = [];
    if (!accountStatus) countPromises.push(countRecords("admin", {}));
    countPromises.push(countRecords("pharmacy", countWherePharmacy));
    countPromises.push(countRecords("medicationCompany", countWhereCompany));
    if (!accountStatus) countPromises.push(countRecords("endUser", {}));

    const totals = await Promise.all(countPromises);
    const totalRecords = totals.reduce((sum, c) => sum + c, 0);

    const fetchPromises = [];
    if (!accountStatus) fetchPromises.push(fetchAndMap("admin", {}, "ADMIN"));
    fetchPromises.push(fetchAndMap("pharmacy", countWherePharmacy, "PHARMACY", subscriptionInclude));
    fetchPromises.push(fetchAndMap("medicationCompany", countWhereCompany, "COMPANY", subscriptionInclude));

    if (!accountStatus) {
        fetchPromises.push(
            prisma.endUser.findMany({
                include: subscriptionInclude,
                orderBy: { createdAt: "desc" },
            }).then(accounts =>
                accounts.map(a => {
                    const { passwordHash, ...rest } = a;
                    return {
                        ...rest,
                        accountType: a.accountType === "paid" ? "PAID_USER" : "FREE_USER",
                    };
                })
            )
        );
    }

    const results = await Promise.all(fetchPromises);
    const merged = results.flat();

    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const accounts = merged.slice(skip, skip + limit);

    return { accounts, totalRecords };
}

async function getAccountsByType(accountType, accountStatus, skip, limit) {
    switch (accountType) {
        case "ADMIN": {
            const [totalRecords, accounts] = await Promise.all([
                countRecords("admin", {}),
                prisma.admin.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            return {
                totalRecords,
                accounts: accounts.map(a => {
                    const { passwordHash, ...rest } = a;
                    return { ...rest, accountType: "ADMIN" };
                }),
            };
        }
        case "PHARMACY": {
            const where = accountStatus ? { accountStatus } : {};
            const [totalRecords, accounts] = await Promise.all([
                countRecords("pharmacy", where),
                prisma.pharmacy.findMany({
                    where,
                    include: subscriptionInclude,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            return {
                totalRecords,
                accounts: accounts.map(a => {
                    const { passwordHash, ...rest } = a;
                    return { ...rest, accountType: "PHARMACY" };
                }),
            };
        }
        case "COMPANY": {
            const where = accountStatus ? { accountStatus } : {};
            const [totalRecords, accounts] = await Promise.all([
                countRecords("medicationCompany", where),
                prisma.medicationCompany.findMany({
                    where,
                    include: subscriptionInclude,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            return {
                totalRecords,
                accounts: accounts.map(a => {
                    const { passwordHash, ...rest } = a;
                    return { ...rest, accountType: "COMPANY" };
                }),
            };
        }
        case "FREE_USER": {
            const where = { accountType: "free" };
            const [totalRecords, accounts] = await Promise.all([
                countRecords("endUser", where),
                prisma.endUser.findMany({
                    where,
                    include: subscriptionInclude,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            return {
                totalRecords,
                accounts: accounts.map(a => {
                    const { passwordHash, ...rest } = a;
                    return { ...rest, accountType: "FREE_USER" };
                }),
            };
        }
        case "PAID_USER": {
            const where = { accountType: "paid" };
            const [totalRecords, accounts] = await Promise.all([
                countRecords("endUser", where),
                prisma.endUser.findMany({
                    where,
                    include: subscriptionInclude,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            return {
                totalRecords,
                accounts: accounts.map(a => {
                    const { passwordHash, ...rest } = a;
                    return { ...rest, accountType: "PAID_USER" };
                }),
            };
        }
        default:
            throw new AppError("Invalid account type", 400);
    }
}

export async function changeAccountStatusService(accountId, newStatus) {
    const pharmacy = await prisma.pharmacy.findUnique({
        where: { id: accountId },
    });

    if (pharmacy) {
        const updated = await prisma.pharmacy.update({
            where: { id: accountId },
            data: { accountStatus: newStatus },
        });
        const { passwordHash, ...rest } = updated;
        return { ...rest, accountType: "PHARMACY" };
    }

    const company = await prisma.medicationCompany.findUnique({
        where: { id: accountId },
    });

    if (company) {
        const updated = await prisma.medicationCompany.update({
            where: { id: accountId },
            data: { accountStatus: newStatus },
        });
        const { passwordHash, ...rest } = updated;
        return { ...rest, accountType: "COMPANY" };
    }

    throw new AppError("Account not found or is not a pharmacy/company account", 404);
}
