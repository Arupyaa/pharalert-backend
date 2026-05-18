import express from "express";
import pharmacySearchRoutes from "./routes/pharmacySearchRoutes.js";

const router = express.Router();
router.use("/pharmacies", pharmacySearchRoutes);
export default router;
