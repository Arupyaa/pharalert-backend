import bcrypt from "bcrypt";
import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const MODEL_MAP = {
    user: "endUser",
    pharmacy: "pharmacy",
    company: "medicationCompany",
};

export async function resetPasswordService(email, accountType, otp, newPassword) {
    const model = MODEL_MAP[accountType];
    if (!model) throw new AppError("Invalid account type", 400);

    const otpRecord = await prisma.oTP.findFirst({
        where: {
            email,
            code: otp,
            type: "FORGOT_PASSWORD",
            expiresAt: { gt: new Date() },
        },
    });

    if (!otpRecord) throw new AppError("Invalid or expired OTP", 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
        await tx.oTP.delete({ where: { id: otpRecord.id } });

        await tx[model].update({
            where: { email },
            data: { passwordHash: hashedPassword },
        });
    });
}
