import express from "express";
import purchasesRoutes from "./routes/receiptRoute.js";
import inventoryRoutes from "./routes/inventoryRoutes.js"
import salesRoutes from "./routes/salesRoute.js"
import demandRoutes from "./routes/demandRoutes.js"

const router = express.Router();

router.use("/purchases", purchasesRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/sales", salesRoutes);
router.use("/demand", demandRoutes);
export default router;