import { getReceiptsPaginated } from "../services/receiptService.js";
import { serializeBigInt } from "../../../utils/serializeBigINT.js";

export const getReceiptsInTable = async (req, res) => {
    const responseJson = await getReceiptsPaginated("758d9ceb-9caf-431c-bd7c-bee3012048ad", "asc", 2, 5);
    res.json(serializeBigInt(responseJson));
}