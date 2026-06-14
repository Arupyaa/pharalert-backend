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
import { identifyService } from "../services/identifyService.js";
import { verifyEmailService } from "../services/verifyEmailService.js";
import generateAccessToken from "../../../utils/generateAccessToken.js";
import { resendVerificationService } from "../services/resendVerificationService.js";
import { forgotPasswordService } from "../services/forgotPasswordService.js";
import { resetPasswordService } from "../services/resetPasswordService.js";
import { verifyEmailSchema } from "../validators/verifyEmailSchema.js";
import { resendVerificationSchema } from "../validators/resendVerificationSchema.js";
import { forgotPasswordSchema } from "../validators/forgotPasswordSchema.js";
import { resetPasswordSchema } from "../validators/resetPasswordSchema.js";
import { purchaseSubscriptionSchema } from "../validators/subscriptionValidator.js";
import { purchaseSubscriptionService, getUserSubscriptionsService } from "../services/subscriptionService.js";

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


//email verification controller

export const verifyEmail = catchAsync(async (req, res) => {
    const result = verifyEmailSchema.safeParse(req.query);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await verifyEmailService(result.data.token);

    res.status(200).json({
        status: "success",
        message: "Email verified successfully",
    });
});

export const resendVerification = catchAsync(async (req, res) => {
    const result = resendVerificationSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await resendVerificationService(result.data.email, result.data.accountType);

    res.status(200).json({
        status: "success",
        message: "Verification email sent",
    });
});

//forgot & reset password controllers

export const forgotPassword = catchAsync(async (req, res) => {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await forgotPasswordService(result.data.email, result.data.accountType);

    res.status(200).json({
        status: "success",
        message: "OTP sent to your email",
    });
});

export const resetPassword = catchAsync(async (req, res) => {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await resetPasswordService(
        result.data.email,
        result.data.accountType,
        result.data.otp,
        result.data.newPassword
    );

    res.status(200).json({
        status: "success",
        message: "Password reset successfully",
    });
});

// subscription controllers

export const subscribe = catchAsync(async (req, res) => {
    const result = purchaseSubscriptionSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const subscription = await purchaseSubscriptionService(
        req.user.id,
        req.user.accountType,
        result.data.paymentMethod
    );

    res.status(201).json({
        status: "success",
        message: "Subscription purchased successfully",
        data: serializeBigInt(subscription),
    });
});

export const getSubscriptions = catchAsync(async (req, res) => {
    const subscriptions = await getUserSubscriptionsService(
        req.user.id,
        req.user.accountType
    );

    res.status(200).json({
        status: "success",
        data: serializeBigInt(subscriptions),
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


// identify controller

export const identifyUser = catchAsync(async (req, res) => {
    const result = await identifyService(req.user.id, req.user.accountType);

    const response = {
        status: "success",
        data: serializeBigInt(result),
    };

    if (result.accountType !== req.user.accountType || result.accountStatus !== req.user.accountStatus) {
        response.accessToken = generateAccessToken({
            id: req.user.id,
            accountType: result.accountType,
            accountStatus: result.accountStatus,
        });
    }

    res.status(200).json(response);
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