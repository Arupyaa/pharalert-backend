import crypto from "crypto";
import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";
import { sendOtpEmail } from "../../../services/emailService.js";

const MODEL_MAP = {
    user: "endUser",
    pharmacy: "pharmacy",
    company: "medicationCompany",
};

const OTP_EXPIRY_MINUTES = 10;

export async function forgotPasswordService(email, accountType) {
    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const account = await prisma[model].findUnique({ where: { email } });
    if (!account) throw new AppError("Account not found", 404);

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.$transaction(async (tx) => {
        await tx.oTP.deleteMany({
            where: { email, type: "FORGOT_PASSWORD" },
        });

        await tx.oTP.create({
            data: {
                email,
                code: otp,
                type: "FORGOT_PASSWORD",
                expiresAt,
            },
        });
    });

    await sendOtpEmail(email, otp, "Password Reset OTP");
}
