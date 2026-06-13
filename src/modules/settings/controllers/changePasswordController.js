import {
    requestOtpSchema,
    confirmChangePasswordSchema,
} from "../validators/changePasswordValidator.js";
import {
    requestOtpService,
    confirmChangePasswordService,
} from "../services/changePasswordService.js";

import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";

export const requestOtp = catchAsync(async (req, res) => {
    const result = requestOtpSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await requestOtpService(
        req.user.id,
        req.user.accountType,
        result.data.currentPassword
    );

    res.status(200).json({
        status: "success",
        message: "OTP sent to your email",
    });
});

export const confirmChangePassword = catchAsync(async (req, res) => {
    const result = confirmChangePasswordSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    await confirmChangePasswordService(
        req.user.id,
        req.user.accountType,
        result.data.otp,
        result.data.newPassword
    );

    res.status(200).json({
        status: "success",
        message: "Password changed successfully",
    });
});
