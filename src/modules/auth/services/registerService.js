import prisma from "../../../prisma.js";
import bcrypt from "bcrypt";
import AppError from "../../../utils/AppError.js";


export const createEndUser =
    async (data) => {
        const existingUser =
            await prisma.endUser.findFirst({
                where: {
                    OR: [
                        {
                            email: data.email,
                        },
                        {
                            userName:
                                data.userName,
                        },
                    ],
                },
            });

        if (existingUser) {
            throw new AppError(
                "Email or username already exists",
                409
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                data.password,
                10
            );

        const user =
            await prisma.endUser.create({
                data: {
                    userName:
                        data.userName,

                    email: data.email,

                    passwordHash:
                        hashedPassword,

                    phoneNumber:
                        data.phoneNumber,

                    address:
                        data.address,

                    latitude:
                        data.latitude,

                    longitude:
                        data.longitude,

                    accountType:
                        "free",
                },
            });

        return user;
    };

export const createPharmacy =
    async (data) => {
        const existingPharmacy =
            await prisma.pharmacy.findUnique({
                where: {
                    email: data.email,
                },
            });

        if (existingPharmacy) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                data.password,
                10
            );

        const pharmacy =
            await prisma.pharmacy.create({
                data: {
                    name: data.name,

                    email: data.email,

                    passwordHash:
                        hashedPassword,

                    address:
                        data.address,

                    latitude:
                        data.latitude,

                    longitude:
                        data.longitude,

                    regionId:
                        data.regionId,

                    currentStatus:
                        "open",

                    accountStatus:
                        "pending",

                    documentImageUrl:
                        data.documentImageUrl,
                },
            });

        return pharmacy;
    };

export const createCompany =
    async (data) => {
        const existingCompany =
            await prisma.medicationCompany.findUnique(
                {
                    where: {
                        email: data.email,
                    },
                }
            );

        if (existingCompany) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                data.password,
                10
            );

        const company =
            await prisma.medicationCompany.create(
                {
                    data: {
                        companyName:
                            data.companyName,

                        email: data.email,

                        passwordHash:
                            hashedPassword,

                        phoneNumber:
                            data.phoneNumber,

                        accountStatus:
                            "pending",

                        documentImageUrl:
                            data.documentImageUrl,
                    },
                }
            );

        return company;
    };