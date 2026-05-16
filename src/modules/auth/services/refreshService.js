import jwt from "jsonwebtoken";
import prisma from "../../../prisma.js"
import AppError from "../../../utils/AppError.js"
import generateAccessToken from "../../../utils/generateAccessToken.js";

export async function refreshService(refreshToken) {
    if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });

    if (!storedToken) {
        throw new AppError("Refresh token not found", 404);
    }

    const accessToken = generateAccessToken({
        id: decoded.id,
        accountType: decoded.accountType
    });

    return { accessToken };
}