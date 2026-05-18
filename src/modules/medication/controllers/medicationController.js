import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import {
    createMedicationSchema,
    updateMedicationSchema,
    getMedicationsSchema,
    getInStockMedicationsSchema,
} from "../validators/medicationValidator.js";
import {
    createMedicationService,
    getMedicationsService,
    getMedicationByIdService,
    getInStockMedicationsService,
    updateMedicationService,
    deleteMedicationService,
} from "../services/medicationService.js";

export const createMedication = catchAsync(async (req, res) => {
    const result = createMedicationSchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const medication = await createMedicationService(result.data);
    res.status(201).json({
        status: "success",
        data: serializeBigInt(medication),
    });
});

export const getMedications = catchAsync(async (req, res) => {
    const result = getMedicationsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const medications = await getMedicationsService(result.data);
    res.status(200).json({
        status: "success",
        data: serializeBigInt(medications),
    });
});

export const getInStockMedications = catchAsync(async (req, res) => {
    const result = getInStockMedicationsSchema.safeParse(req.query);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const medications = await getInStockMedicationsService(result.data);
    res.status(200).json({
        status: "success",
        data: serializeBigInt(medications),
    });
});

export const getMedicationById = catchAsync(async (req, res) => {
    const id = BigInt(req.params.id);

    const medication = await getMedicationByIdService(id);
    res.status(200).json({
        status: "success",
        data: serializeBigInt(medication),
    });
});

export const updateMedication = catchAsync(async (req, res) => {
    const result = updateMedicationSchema.safeParse(req.body);
    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const id = BigInt(req.params.id);
    const medication = await updateMedicationService(id, result.data);
    res.status(200).json({
        status: "success",
        data: serializeBigInt(medication),
    });
});

export const deleteMedication = catchAsync(async (req, res) => {
    const id = BigInt(req.params.id);

    await deleteMedicationService(id);
    res.status(200).json({
        status: "success",
        message: "Medication deleted successfully",
    });
});
