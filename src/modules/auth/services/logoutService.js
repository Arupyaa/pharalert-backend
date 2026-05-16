import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

export async function logoutService(refreshToken) {
    if (!refreshToken) {
        throw new AppError(
            "Refresh token is required",
            400
        );
    }

    const deleted = await prisma.refreshToken.deleteMany({
        where: {
            token: refreshToken,
        },
    });

    if (deleted.count === 0) {
        throw new AppError(
            "Refresh token not found",
            404
        );
    }

    return true;
}