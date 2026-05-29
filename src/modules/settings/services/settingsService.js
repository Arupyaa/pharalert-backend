import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const FIELD_MAP = {
    ADMIN: ["userName", "email"],
    PHARMACY: ["name", "email", "address", "latitude", "longitude", "openingHour", "closingHour", "documentImageUrl", "regionId"],
    COMPANY: ["companyName", "email", "phoneNumber", "documentImageUrl"],
    FREE_USER: ["userName", "email", "phoneNumber", "address", "latitude", "longitude"],
    PAID_USER: ["userName", "email", "phoneNumber", "address", "latitude", "longitude"],
};

const MODEL_MAP = {
    ADMIN: "admin",
    PHARMACY: "pharmacy",
    COMPANY: "medicationCompany",
    FREE_USER: "endUser",
    PAID_USER: "endUser",
};

export async function getMySettingsService(userId, accountType) {
    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const account = await prisma[model].findUnique({
        where: { id: userId },
    });

    if (!account) throw new AppError("Account not found", 404);

    const { passwordHash, ...safeAccount } = account;
    return { ...safeAccount, accountType };
}

export async function updateMySettingsService(userId, accountType, data) {
    const allowedFields = FIELD_MAP[accountType];
    if (!allowedFields) throw new AppError("Invalid account type", 400);

    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const filteredData = {};
    for (const key of Object.keys(data)) {
        if (allowedFields.includes(key)) {
            filteredData[key] = data[key];
        }
    }

    if (Object.keys(filteredData).length === 0) {
        throw new AppError("No valid fields provided for your account type", 400);
    }

    const account = await prisma[model].update({
        where: { id: userId },
        data: filteredData,
    });

    const { passwordHash, ...safeAccount } = account;
    return { ...safeAccount, accountType };
}
