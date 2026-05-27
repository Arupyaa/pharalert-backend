import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import {
    getAccountsQuerySchema,
    changeAccountStatusParamsSchema,
    changeAccountStatusBodySchema,
} from "../validators/accountValidator.js";
import {
    getAllAccountsService,
    changeAccountStatusService,
} from "../services/accountService.js";

export const getAllAccounts = catchAsync(async (req, res) => {
    const result = getAccountsQuerySchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const { accountType, accountStatus, page, limit } = result.data;
    const { accounts, totalRecords } = await getAllAccountsService(
        accountType,
        accountStatus,
        page,
        limit
    );

    res.status(200).json({
        status: "success",
        totalRecords,
        page,
        limit,
        data: serializeBigInt(accounts),
    });
});

export const changeAccountStatus = catchAsync(async (req, res) => {
    const paramsResult = changeAccountStatusParamsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        throw new AppError("Validation failed", 400, paramsResult.error.flatten());
    }

    const bodyResult = changeAccountStatusBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
        throw new AppError("Validation failed", 400, bodyResult.error.flatten());
    }

    const account = await changeAccountStatusService(
        paramsResult.data.id,
        bodyResult.data.accountStatus
    );

    res.status(200).json({
        status: "success",
        message: "Account status updated successfully",
        data: serializeBigInt(account),
    });
});
