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


//registration controllers

export const registerUser =
    catchAsync(async (req, res) => {
        const result =
            registerEndUserSchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new AppError(
                JSON.stringify(
                    result.error.flatten()
                ),
                400
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
                JSON.stringify(
                    result.error.flatten()
                ),
                400
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
                JSON.stringify(
                    result.error.flatten()
                ),
                400
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


//login and logout controllers


export const loginUser = async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.flatten(),
        });
    }

    try {
        const data = await loginService(result.data);

        return res.status(200).json({
            message: "Login successful",
            ...data,
        });

    } catch (err) {
        return res.status(err.status || 500).json({
            message: err.message,
        });
    }
};


export const logoutUser = async (req, res) => {
    try {
        const refreshToken =
            req.body.refreshToken || req.cookies?.refreshToken;

        await logoutService(refreshToken);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (err) {
        return res.status(err.status || 500).json({
            message: err.message,
        });
    }
};