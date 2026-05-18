import express from "express";
import {
    createMedication,
    getMedications,
    getInStockMedications,
    getMedicationById,
    updateMedication,
    deleteMedication,
} from "../controllers/medicationController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", getMedications);
router.get("/in-stock", getInStockMedications);
router.get("/:id", getMedicationById);
router.post("/", authenticate, authorize("PHARMACY", "COMPANY", "ADMIN"), createMedication);
router.patch("/:id", authenticate, authorize("ADMIN"), updateMedication);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteMedication);

export default router;
