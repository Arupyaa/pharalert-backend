import express from "express";
import {
    createMedication,
    getMedications,
    getInStockMedications,
    getMedicationById,
    updateMedication,
    deleteMedication,
    getUnlinkedMedications,
} from "../controllers/medicationController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/unlinked", getUnlinkedMedications);
router.get("/", getMedications);
router.get("/in-stock", getInStockMedications);
router.get("/:id", getMedicationById);
router.post("/", authenticate, authorize("PHARMACY", "COMPANY", "ADMIN"), createMedication);
router.patch("/:id", authenticate, authorize("ADMIN", "PHARMACY", "COMPANY"), updateMedication);
router.delete("/:id", authenticate, authorize("ADMIN", "PHARMACY", "COMPANY"), deleteMedication);

export default router;
