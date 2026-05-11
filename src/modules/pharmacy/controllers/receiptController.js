import { queryReceiptById, queryReceiptBymedicationIncluded, queryReceipts, queryReceiptsPaginated } from "../services/receiptService.js";
import { serializeBigInt } from "../../../utils/serializeBigINT.js";

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

    const responseJson = await queryReceiptsPaginated(pharmacyId,order,page,limit);
    res.json(serializeBigInt(responseJson));
}

export const getReceipt = async (req, res) => {
    const pharmacyId = req.params.pid;
    const receiptId = req.params.rid;

    const responseJson = await queryReceiptById(pharmacyId,receiptId);
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