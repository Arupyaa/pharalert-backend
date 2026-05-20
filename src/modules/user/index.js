import express from "express";
import pharmacySearchRoutes from "./routes/pharmacySearchRoutes.js";
import reservationRoutes from "./reservations/routes/reservationRoutes.js"

const router = express.Router();
router.use("/pharmacies", pharmacySearchRoutes);
router.use("/reservations", reservationRoutes);
export default router;
