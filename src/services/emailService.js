import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 1025,
});

export async function sendOtpEmail(email, otp, subject = "Password Change OTP") {
    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject,
        text: `Your OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendStockAlertEmail(email, medicationName, pharmacyName) {
    const subject = pharmacyName
        ? `Medication Back in Stock at ${pharmacyName}`
        : "Medication Back in Stock in Your Region";

    const locationText = pharmacyName
        ? `is now back in stock at ${pharmacyName}`
        : "is now back in stock in your region";

    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject,
        text: `Good news!\n\n${medicationName} ${locationText}.\n\nVisit PharAlert to purchase or reserve it.`,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email, token) {
    const link = `http://localhost:8080/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject: "Verify your email address",
        text: `Welcome to PharAlert!\n\nPlease verify your email address by clicking the link below:\n\n${link}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
}
