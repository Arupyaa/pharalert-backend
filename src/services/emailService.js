import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 1025,
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export async function sendOtpEmail(email, otp, subject = "Password Change OTP") {
    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject,
        text: `Your OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
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

    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email, token) {
    const link = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject: "Verify your email address",
        text: `Welcome to PharAlert!\n\nPlease verify your email address by clicking the link below:\n\n${link}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
}
