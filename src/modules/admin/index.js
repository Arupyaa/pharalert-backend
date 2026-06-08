import express from "express";
import accountRoutes from "./routes/accountRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";

const router = express.Router();

router.use("/", accountRoutes);
router.use("/", reservationRoutes);
router.use("/", medicationRoutes);

export default router;
