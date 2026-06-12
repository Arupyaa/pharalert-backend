import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 1025,
});

export async function sendOtpEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || "pharalert@local",
        to: email,
        subject: "Password Change OTP",
        text: `Your OTP for changing your password is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
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
