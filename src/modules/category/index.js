import express from "express";
import categoryRoutes from "./routes/categoryRoutes.js";

const router = express.Router();

router.use("/", categoryRoutes);

export default router;
