import prisma from "../../../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginService = async ({ role, email, password }) => {
    let account;
    let idField;

    // 1. fetch user by role
    switch (role) {
        case "admin":
            account = await prisma.admin.findUnique({ where: { email } });
            idField = "adminId";
            break;

        case "pharmacy":
            account = await prisma.pharmacy.findUnique({ where: { email } });
            idField = "pharmacyId";
            break;

        case "company":
            account = await prisma.medicationCompany.findUnique({ where: { email } });
            idField = "companyId";
            break;

        case "user":
            account = await prisma.endUser.findUnique({ where: { email } });
            idField = "userId";
            break;

        default:
            throw { status: 400, message: "Invalid role" };
    }

    // 2. validate existence
    if (!account) {
        throw { status: 404, message: "User not found" };
    }

    // 3. password check (bcrypt belongs HERE)
    const isValid = await bcrypt.compare(password, account.passwordHash);

    if (!isValid) {
        throw { status: 401, message: "Invalid credentials" };
    }

    // 4. generate tokens
    const accessToken = jwt.sign(
        { id: account.id, role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
        { id: account.id, role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "14d" }
    );

    // 5. store refresh token
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            [idField]: account.id,
        },
    });

    return {
        accessToken,
        refreshToken,
    };
};