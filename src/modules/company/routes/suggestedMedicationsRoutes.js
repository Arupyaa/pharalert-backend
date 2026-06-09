import express from "express";
import { getMySuggestedMedications } from "../controllers/suggestedMedicationsController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/suggested-medications", authenticate, authorize("COMPANY"), getMySuggestedMedications);

export default router;
