import express from "express";

import {
    getOutOfStock,
    subscribe,
    unsubscribe,
    getAlerts,
} from "../controllers/stockAlertController.js";

import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/out-of-stock", authenticate, authorize("FREE_USER", "PAID_USER"), getOutOfStock);
router.post("/subscribe", authenticate, authorize("PAID_USER"), subscribe);
router.delete("/:id", authenticate, authorize("FREE_USER", "PAID_USER"), unsubscribe);
router.get("/", authenticate, authorize("FREE_USER", "PAID_USER"), getAlerts);

export default router;
