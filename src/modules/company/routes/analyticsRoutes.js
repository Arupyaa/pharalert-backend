import express from "express";
import { getMedicationsTableAnalytics, getPharmaciesTableAnalytics } from "../controllers/analyticsController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/pharmacies/table", authenticate, authorize("COMPANY", "ADMIN"), getPharmaciesTableAnalytics);
router.get("/medications/table", authenticate, authorize("COMPANY", "ADMIN"), getMedicationsTableAnalytics);

export default router;
