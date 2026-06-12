import express from "express";

import { getInventory, addInventory } from "../controllers/inventoryController.js";
import { getInventoryByMedicationId } from "../controllers/inventoryController.js";

import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", authenticate, authorize("PHARMACY"), getInventory);
router.post("/", authenticate, authorize("PHARMACY"), addInventory);
router.get("/medicationId/:mid", authenticate, authorize("PHARMACY"), getInventoryByMedicationId);

export default router;