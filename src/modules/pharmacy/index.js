import express from "express";
import purchasesRoutes from "./routes/receiptRoute.js";
import inventoryRoutes from "./routes/inventoryRoutes.js"
import salesRoutes from "./routes/salesRoute.js"
import demandRoutes from "./routes/demandRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import barcodeRoutes from "./routes/barcodeRoute.js"

const router = express.Router();

router.use("/purchases", purchasesRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/sales", salesRoutes);
router.use("/demand", demandRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/barcode", barcodeRoutes);
export default router;