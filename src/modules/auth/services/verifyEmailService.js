import jwt from "jsonwebtoken";
import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

export async function verifyEmailService(token) {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.VERIFY_EMAIL_SECRET);
    } catch {
        throw new AppError("Invalid or expired verification link", 400);
    }

    const { email, model } = decoded;

    if (!email || !model) {
        throw new AppError("Invalid verification link", 400);
    }

    const validModels = ["endUser", "pharmacy", "medicationCompany"];
    if (!validModels.includes(model)) {
        throw new AppError("Invalid verification link", 400);
    }

    const account = await prisma[model].findUnique({ where: { email } });
    if (!account) {
        throw new AppError("Account not found", 404);
    }

    if (account.isEmailVerified) {
        throw new AppError("Email already verified", 400);
    }

    await prisma[model].update({
        where: { email },
        data: { isEmailVerified: true },
    });
}
