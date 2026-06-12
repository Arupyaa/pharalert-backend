import jwt from "jsonwebtoken";
import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";
import { sendVerificationEmail } from "../../../services/emailService.js";

const MODEL_MAP = {
    user: "endUser",
    pharmacy: "pharmacy",
    company: "medicationCompany",
};

export async function resendVerificationService(email, accountType) {
    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const account = await prisma[model].findUnique({ where: { email } });
    if (!account) throw new AppError("Account not found", 404);

    if (account.isEmailVerified) {
        throw new AppError("Email already verified", 400);
    }

    const token = jwt.sign({ email, model }, process.env.VERIFY_EMAIL_SECRET, {
        expiresIn: "24h",
    });

    await sendVerificationEmail(email, token);
}
