import express from "express";

import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

import { getAnalyticsSummary, } from "../controllers/analyticsController.js";
import { getSalesPerformance, } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", authenticate, authorize("PHARMACY"), getAnalyticsSummary);
router.get("/sales-performance", authenticate, authorize("PHARMACY"), getSalesPerformance);

export default router;