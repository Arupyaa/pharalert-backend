import express from "express";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const router = express.Router();

router.use("/analytics", analyticsRoutes);

export default router;
