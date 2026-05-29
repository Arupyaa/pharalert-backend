import express from "express";
import accountRoutes from "./routes/accountRoutes.js";

const router = express.Router();

router.use("/", accountRoutes);

export default router;
