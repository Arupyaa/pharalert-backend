import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function sendOtpEmail(email, otp, subject = "Password Change OTP") {
    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || "PharAlert <onboarding@resend.dev>",
            to: email,
            subject,
            text: `Your OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
        });
    } catch (err) {
        console.error(`Failed to send OTP email to ${email}:`, err.message);
        throw err;
    }
}

export async function sendStockAlertEmail(email, medicationName, pharmacy, isRegionAlert = false) {
    const pharmacyName = pharmacy?.name || "a pharmacy";
    const pharmacyLink = pharmacy?.id ? `${FRONTEND_URL}/user/pharmacy/${pharmacy.id}` : null;

    const subject = isRegionAlert
        ? `Medication Back in Stock at ${pharmacyName} in Your Region`
        : `Medication Back in Stock at ${pharmacyName}`;

    let text = `Good news!\n\n${medicationName} is now back in stock at ${pharmacyName}${isRegionAlert ? " in your region" : ""}.\n\n`;

    if (pharmacyLink) {
        text += `View Pharmacy: ${pharmacyLink}\n\n`;
    }

    text += `Visit PharAlert to purchase or reserve it.`;

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || "PharAlert <onboarding@resend.dev>",
            to: email,
            subject,
            text,
        });
    } catch (err) {
        console.error(`Failed to send stock alert email to ${email}:`, err.message);
        throw err;
    }
}

export async function sendVerificationEmail(email, token) {
    const link = `${BACKEND_URL}/auth/verify-email?token=${token}`;

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || "PharAlert <onboarding@resend.dev>",
            to: email,
            subject: "Verify your email address",
            text: `Welcome to PharAlert!\n\nPlease verify your email address by clicking the link below:\n\n${link}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, please ignore this email.`,
        });
    } catch (err) {
        console.error(`Failed to send verification email to ${email}:`, err.message);
        throw err;
    }
}
