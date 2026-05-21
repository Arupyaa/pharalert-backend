import express from "express";
import { getMedicationsTableAnalytics, getPharmaciesTableAnalytics, getRegionsChartsAnalytics } from "../controllers/analyticsController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/regions/charts", authenticate, authorize("COMPANY", "ADMIN"), getRegionsChartsAnalytics);
router.get("/pharmacies/table", authenticate, authorize("COMPANY", "ADMIN"), getPharmaciesTableAnalytics);
router.get("/medications/table", authenticate, authorize("COMPANY", "ADMIN"), getMedicationsTableAnalytics);

export default router;
