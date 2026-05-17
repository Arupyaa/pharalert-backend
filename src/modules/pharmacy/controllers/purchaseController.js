import { getPurchasesSchema } from "../validators/getPurchasesSchema.js";
import { getPurchasesService, createPurchaseService } from "../services/purchaseService.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { receiptSchema } from "../validators/receiptValidator.js";
import catchAsync from "../../../utils/catchAsync.js";
import { createPurchaseSchema } from "../validators/purchaseValidator.js";
//get request
export const getPurchases = catchAsync(async (req, res) => {
    const result = getPurchasesSchema.safeParse(req.query);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const pharmacyId = req.user.id;

    const returnedData = await getPurchasesService(pharmacyId, result.data);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(returnedData.data),
        pagination: returnedData.pagination,
    });
});

//post request
export const createPurchase = catchAsync(async (req, res) => {
    const result = createPurchaseSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError(
            "Validation failed",
            400,
            result.error.flatten()
        );
    }

    const pharmacyId = req.user.id;

    const purchase = await createPurchaseService(
        pharmacyId,
        result.data
    );

    res.status(201).json({
        status: "success",
        message: "Purchase was successful",
        data: serializeBigInt(purchase),
    });
});