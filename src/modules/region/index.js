import express from "express";
import regionRoutes from "./routes/regionRoutes.js";

const router = express.Router();

router.use("/", regionRoutes);

export default router;
