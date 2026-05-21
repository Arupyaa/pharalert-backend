import express from "express";
import { getMedicationsTableAnalytics } from "../controllers/analyticsController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/medications/table", authenticate, authorize("COMPANY", "ADMIN"), getMedicationsTableAnalytics);

export default router;
