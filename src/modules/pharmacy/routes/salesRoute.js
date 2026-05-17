import express from "express";
import { getMedicationSales } from "../controllers/salesController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/medication-sales", authenticate, authorize("PHARMACY"), getMedicationSales);
export default router;