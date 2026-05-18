import express from "express";

import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

import { getAnalyticsSummary, } from "../controllers/analyticsController.js";
import { getSalesPerformance, getMonthlyProfit, getTopSellingMedications, getCustomerActivity } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", authenticate, authorize("PHARMACY"), getAnalyticsSummary);
router.get("/sales-performance", authenticate, authorize("PHARMACY"), getSalesPerformance);
router.get("/monthly-profit",authenticate,authorize("PHARMACY"),getMonthlyProfit);
router.get("/top-selling-medications",authenticate,authorize("PHARMACY"),getTopSellingMedications);
router.get("/customer-activity",authenticate,authorize("PHARMACY"),getCustomerActivity);

export default router;