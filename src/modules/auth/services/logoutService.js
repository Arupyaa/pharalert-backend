import prisma from "../../../prisma.js"

export async function logoutService(refreshToken) {
    if (!refreshToken) {
        throw { status: 400, message: "Refresh token is required" };
    }

    const deleted = await prisma.refreshToken.deleteMany({
        where: {
            token: refreshToken,
        },
    });

    if (deleted.count === 0) {
        throw {
            status: 404,
            message: "Refresh token not found",
        };
    }

    return true;
};