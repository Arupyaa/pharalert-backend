import express from "express";
import purchasesRoutes from "./routes/receiptRoute.js";

const router = express.Router();

router.use("/purchases",purchasesRoutes);

export default router;