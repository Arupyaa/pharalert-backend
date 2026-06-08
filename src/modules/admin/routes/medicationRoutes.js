import express from "express";
import { getAllMedications } from "../controllers/medicationController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/medications", authenticate, authorize("ADMIN"), getAllMedications);

export default router;
