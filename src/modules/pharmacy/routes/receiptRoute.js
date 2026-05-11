import express from "express";
import { getAllReceipts, getReceipt, getReceiptByMedication, getReceiptsInTable } from "../controllers/receiptController.js";

const router = express.Router({
    mergeParams:true
});

router.get("/",getAllReceipts);
router.get("/table", getReceiptsInTable);
router.get("/medication/:mid",getReceiptByMedication);
router.get("/:rid",getReceipt);

export default router;