import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/AppError.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getAccountsQuerySchema } from "../validators/accountValidator.js";
import { getAllAccountsService } from "../services/accountService.js";

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
