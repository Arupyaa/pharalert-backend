import { addReceiptRecord, queryReceiptById, queryReceiptBymedicationIncluded, queryReceipts, queryReceiptsPaginated } from "../services/receiptService.js";
import { serializeBigInt } from "../../../utils/serializeBigINT.js";
import { receiptSchema } from "../validators/receiptValidator.js";

//no pagination
export const getAllReceipts = async (req, res) => {
    const pharmacyId = req.params.pid;
    const responseJson = await queryReceipts(pharmacyId);
    res.json(serializeBigInt(responseJson));
}

export const getReceiptsInTable = async (req, res) => {
    const pharmacyId = req.params.pid;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const order = req.query.order || "asc";

    const responseJson = await queryReceiptsPaginated(pharmacyId, order, page, limit);
    res.json(serializeBigInt(responseJson));
}

export const getReceipt = async (req, res) => {
    const pharmacyId = req.params.pid;
    const receiptId = req.params.rid;

    const responseJson = await queryReceiptById(pharmacyId, receiptId);
    res.json(serializeBigInt(responseJson));
}

export const getReceiptByMedication = async (req, res) => {
    const pharmacyId = req.params.pid;
    const medicationId = req.params.mid;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const order = req.query.order || "asc";

    const responseJson = await queryReceiptBymedicationIncluded(pharmacyId, medicationId, order, page, limit);
    res.json(serializeBigInt(responseJson));
}

export const addReceipt = async (req, res) => {
    const validateBody = receiptSchema.safeParse(req.body);
    if (!validateBody.success) {
        return res.status(400).json({
            message: "Invalid request body",
            errors: validateBody.error.issues
        })
    } else if (validateBody.data.data.pharmacyId != req.params.pid) {
        return res.status(400).json({
            message: "Invalid request body, pharmacyId doesn't match pharmacyId accessed from",
            accessedPharmacyId:req.params.pid,
            bodyPharmacyId:validateBody.data.data.pharmacyId
        })
    }
    else {
        const result = await addReceiptRecord(validateBody.data.data);
        res.status(201).json({
            message: "added receipt successfully",
            data: serializeBigInt(result)
        })
    }

}