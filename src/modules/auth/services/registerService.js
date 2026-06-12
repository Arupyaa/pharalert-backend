import prisma from "../../../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../../../utils/AppError.js";
import { sendVerificationEmail } from "../../../services/emailService.js";


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

        const token = jwt.sign(
            { email: user.email, model: "endUser" },
            process.env.VERIFY_EMAIL_SECRET,
            { expiresIn: "24h" }
        );

        await sendVerificationEmail(user.email, token);

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

        const token = jwt.sign(
            { email: pharmacy.email, model: "pharmacy" },
            process.env.VERIFY_EMAIL_SECRET,
            { expiresIn: "24h" }
        );

        await sendVerificationEmail(pharmacy.email, token);

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

        if (
            data.suggestedMedicationIds &&
            data.suggestedMedicationIds.length > 0
        ) {
            await prisma.companySuggestedMedication.createMany({
                data: data.suggestedMedicationIds.map(
                    (medicationId) => ({
                        companyId: company.id,
                        medicationId,
                    })
                ),
            });
        }

        const token = jwt.sign(
            { email: company.email, model: "medicationCompany" },
            process.env.VERIFY_EMAIL_SECRET,
            { expiresIn: "24h" }
        );

        await sendVerificationEmail(company.email, token);

        return company;
    };