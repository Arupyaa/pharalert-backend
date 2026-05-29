import express from "express";
import settingsRoutes from "./routes/settingsRoutes.js";

const router = express.Router();

router.use("/", settingsRoutes);

export default router;
