import express from "express";
import receiptsRoutes from "./routes/receiptRoute.js";

const router = express.Router();

router.use("/:pid/receipts",receiptsRoutes);

export default router;