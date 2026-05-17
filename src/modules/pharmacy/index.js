import express from "express";
import purchasesRoutes from "./routes/receiptRoute.js";
import inventoryRoutes from "./routes/inventoryRoutes.js"

const router = express.Router();

router.use("/purchases", purchasesRoutes);
router.use("/inventory", inventoryRoutes);

export default router;