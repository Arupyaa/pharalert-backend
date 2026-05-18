import express from "express";
import purchasesRoutes from "./routes/receiptRoute.js";
import inventoryRoutes from "./routes/inventoryRoutes.js"
import salesRoutes from "./routes/salesRoute.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"

const router = express.Router();

router.use("/purchases", purchasesRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/sales", salesRoutes);
router.use("/analytics", analyticsRoutes);
export default router;