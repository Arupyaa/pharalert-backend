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
