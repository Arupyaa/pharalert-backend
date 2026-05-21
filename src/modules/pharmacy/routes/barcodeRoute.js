import express from "express";
import {
    getAllBarcodes,
    getBarcodeByValue,
    createBarcode,
} from "../controllers/barcodeController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", authenticate, authorize("PHARMACY", "COMPANY", "ADMIN"), getAllBarcodes);
router.get("/:barcode", authenticate, authorize("PHARMACY", "COMPANY", "ADMIN"), getBarcodeByValue);
router.post("/", authenticate, authorize("PHARMACY", "COMPANY", "ADMIN"), createBarcode);

export default router;
