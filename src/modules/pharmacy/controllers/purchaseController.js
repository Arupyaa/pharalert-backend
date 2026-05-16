import { getPurchasesSchema } from "../validators/getPurchasesSchema.js";
import { getPurchasesService } from "../services/purchaseService.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { receiptSchema } from "../validators/receiptValidator.js";
import catchAsync from "../../../utils/catchAsync.js";

export const getPurchases = catchAsync(async (req, res) => {
    const result = getPurchasesSchema.safeParse({
        query: req.query,
    });

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const pharmacyId = req.user.id;

    const returnedData = await getPurchasesService(pharmacyId, result.data.query);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(returnedData.data),
        pagination: returnedData.pagination,
    });
});