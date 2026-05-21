import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { createBarcodeSchema } from "../validators/barcodeValidator.js";
import {
    getAllBarcodesService,
    getBarcodeByValueService,
    createBarcodeService,
} from "../services/barcodeService.js";

export const getAllBarcodes = catchAsync(async (req, res) => {
    const barcodes = await getAllBarcodesService();
    res.status(200).json({ status: "success", data: serializeBigInt(barcodes) });
});

export const getBarcodeByValue = catchAsync(async (req, res) => {
    const barcode = await getBarcodeByValueService(req.params.barcode);
    res.status(200).json({ status: "success", data: serializeBigInt(barcode) });
});

export const createBarcode = catchAsync(async (req, res) => {
    const result = createBarcodeSchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const barcode = await createBarcodeService(result.data);
    res.status(201).json({ status: "success", data: serializeBigInt(barcode) });
});
