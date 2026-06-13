import bcrypt from "bcrypt";
import prisma from "../../../prisma.js"
import AppError from "../../../utils/AppError.js";
import generateAccessToken from "../../../utils/generateAccessToken.js";
import generateRefreshToken from "../../../utils/generateRefreshToken.js";

export const loginService =
    async ({
        role,
        email,
        password,
    }) => {
        let account;

        let idField;

        let accountType;

        switch (role) {
            case "admin":
                account =
                    await prisma.admin.findUnique(
                        {
                            where: {
                                email,
                            },
                        }
                    );

                idField = "adminId";

                accountType = "ADMIN";

                break;

            case "pharmacy":
                account =
                    await prisma.pharmacy.findUnique(
                        {
                            where: {
                                email,
                            },
                        }
                    );

                idField =
                    "pharmacyId";

                accountType =
                    "PHARMACY";

                break;

            case "company":
                account =
                    await prisma.medicationCompany.findUnique(
                        {
                            where: {
                                email,
                            },
                        }
                    );

                idField =
                    "companyId";

                accountType =
                    "COMPANY";

                break;

            case "user":
                account =
                    await prisma.endUser.findUnique(
                        {
                            where: {
                                email,
                            },
                        }
                    );

                idField = "userId";

                break;

            default:
                throw new AppError(
                    "Invalid role",
                    400
                );
        }

        if (!account) {
            throw new AppError(
                "Invalid credentials",
                401
            );
        }

        const isValid =
            await bcrypt.compare(
                password,
                account.passwordHash
            );

        if (!isValid) {
            throw new AppError(
                "Invalid credentials",
                401
            );
        }

        /*
          EndUser role mapping
        */

        if (role === "user") {
            accountType =
                account.accountType ===
                    "paid"
                    ? "PAID_USER"
                    : "FREE_USER";
        }

        /*
          Optional account status checks
        */

        if (
            account.accountStatus ===
            "pending"
        ) {
            throw new AppError(
                "Account pending approval",
                403
            );
        }

        if (
            account.accountStatus ===
            "rejected"
        ) {
            throw new AppError(
                "Account rejected",
                403
            );
        }

        // if (
        //     account.accountStatus ===
        //     "inactive"
        // ) {
        //     throw new AppError(
        //         "Account inactive",
        //         403
        //     );
        // }

        /*
          Unified JWT payload
        */

        const accountStatus =
            role === "admin" ? null
            : role === "user" ? account.accountType
            : account.accountStatus;

        const payload = {
            id: account.id,
            accountType,
            accountStatus,
        };

        const accessToken =
            generateAccessToken(
                payload
            );

        const refreshToken =
            generateRefreshToken(
                payload
            );

        /*
          Store refresh token
        */

        await prisma.refreshToken.create(
            {
                data: {
                    token:
                        refreshToken,

                    [idField]:
                        account.id,
                },
            }
        );

        return {
            accessToken,
            refreshToken,
            accountType,
            accountStatus,
        };
    };