import express from "express";
import { getReceiptsInTable } from "../controllers/receiptController.js";

const router = express.Router();

router.get("/", getReceiptsInTable);

export default router;