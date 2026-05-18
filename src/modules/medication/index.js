import express from "express";
import medicationRoutes from "./routes/medicationRoutes.js";

const router = express.Router();

router.use("/", medicationRoutes);

export default router;
