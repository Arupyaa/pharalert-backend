import express from "express";
import { searchPharmacies } from "../controllers/pharmacySearchController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();
router.get("/search", authenticate, authorize("FREE_USER", "PAID_USER"), searchPharmacies);
export default router;
