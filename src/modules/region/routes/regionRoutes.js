import express from "express";
import { getRegions, createRegion } from "../controllers/regionController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", getRegions);
router.post("/", authenticate, authorize("ADMIN"), createRegion);

export default router;
