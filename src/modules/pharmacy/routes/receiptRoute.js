import express from "express";
import { getPurchases, createPurchase } from "../controllers/purchaseController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", authenticate, authorize("PHARMACY"), getPurchases);
router.post("/", authenticate, authorize("PHARMACY"), createPurchase);
export default router;