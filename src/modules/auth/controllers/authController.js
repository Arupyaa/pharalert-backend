import { loginSchema } from "../validators/loginSchema.js";
import { loginService } from "../services/loginService.js";
import { logoutService } from "../services/logoutService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import {
    registerEndUserSchema,
    registerPharmacySchema,
    registerCompanySchema,
} from "../validators/registerSchemas.js";

import {
    createEndUser,
    createPharmacy,
    createCompany,
} from "../services/registerService.js";
import { refreshService } from "../services/refreshService.js";

//registration controllers

export const registerUser =
    catchAsync(async (req, res) => {
        const result =
            registerEndUserSchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new AppError(
                "Validation failed",
                400,
                result.error.flatten()
            );
        }

        const user =
            await createEndUser(
                result.data
            );

        const {
            passwordHash,
            ...safeUser
        } = user;

        res.status(201).json({
            status: "success",
            message:
                "User registered successfully",
            data: serializeBigInt(safeUser),
        });
    });

export const registerPharmacy =
    catchAsync(async (req, res) => {
        const result =
            registerPharmacySchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new AppError(
                "Validation failed",
                400,
                result.error.flatten()
            );
        }

        const pharmacy =
            await createPharmacy(
                result.data
            );

        const {
            passwordHash,
            ...safePharmacy
        } = pharmacy;

        res.status(201).json({
            status: "success",
            message:
                "Pharmacy registration submitted successfully",
            data: serializeBigInt(safePharmacy),
        });
    });

export const registerCompany =
    catchAsync(async (req, res) => {
        const result =
            registerCompanySchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new AppError(
                "Validation failed",
                400,
                result.error.flatten()
            );
        }

        const company =
            await createCompany(
                result.data
            );

        const {
            passwordHash,
            ...safeCompany
        } = company;

        res.status(201).json({
            status: "success",
            message:
                "Company registration submitted successfully",
            data: serializeBigInt(safeCompany),
        });
    });


//login controller


export const loginUser =
    catchAsync(async (
        req,
        res
    ) => {
        const result =
            loginSchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new AppError(
                "Validation failed",
                400,
                result.error.flatten()
            );
        }

        const data =
            await loginService(
                result.data
            );

        res.status(200).json({
            status: "success",

            message:
                "Login successful",

            ...data,
        });
    });

//logout controller

export const logoutUser = catchAsync(async (req, res) => {
    const refreshToken =
        req.body.refreshToken ||
        req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new AppError(
            "Refresh token is required",
            400
        );
    }

    await logoutService(refreshToken);

    res.status(200).json({
        status: "success",
        message: "Logged out successfully",
    });
});


// refresh controller

export const refreshToken = catchAsync(async (req, res) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;

    if (!token) {
        throw new AppError("Refresh token is required", 400);
    }

    const data = await refreshService(token);

    res.status(200).json({
        status: "success",
        ...data
    });
});