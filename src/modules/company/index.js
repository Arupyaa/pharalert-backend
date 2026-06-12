import express from "express";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import suggestedMedicationsRoutes from "./routes/suggestedMedicationsRoutes.js";

const router = express.Router();

router.use("/analytics", analyticsRoutes);
router.use("/", suggestedMedicationsRoutes);

export default router;
