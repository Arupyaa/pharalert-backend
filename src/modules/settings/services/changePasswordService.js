import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";
import { sendOtpEmail } from "../../../services/emailService.js";

const MODEL_MAP = {
    ADMIN: "admin",
    PHARMACY: "pharmacy",
    COMPANY: "medicationCompany",
    FREE_USER: "endUser",
    PAID_USER: "endUser",
};

const OTP_EXPIRY_MINUTES = 10;

export async function requestOtpService(userId, accountType, currentPassword) {
    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const account = await prisma[model].findUnique({ where: { id: userId } });
    if (!account) throw new AppError("Account not found", 404);

    const isValid = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!isValid) throw new AppError("Current password is incorrect", 400);

    const email = account.email;
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.$transaction(async (tx) => {
        await tx.oTP.deleteMany({
            where: { email, type: "CHANGE_PASSWORD" },
        });

        await tx.oTP.create({
            data: {
                email,
                code: otp,
                type: "CHANGE_PASSWORD",
                expiresAt,
            },
        });
    });

    await sendOtpEmail(email, otp);
}

export async function confirmChangePasswordService(userId, accountType, otp, newPassword) {
    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const account = await prisma[model].findUnique({ where: { id: userId } });
    if (!account) throw new AppError("Account not found", 404);

    const email = account.email;

    const otpRecord = await prisma.oTP.findFirst({
        where: {
            email,
            code: otp,
            type: "CHANGE_PASSWORD",
            expiresAt: { gt: new Date() },
        },
    });

    if (!otpRecord) throw new AppError("Invalid or expired OTP", 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
        await tx.oTP.delete({ where: { id: otpRecord.id } });

        await tx[model].update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });
    });
}
