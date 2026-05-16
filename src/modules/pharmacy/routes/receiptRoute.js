import express from "express";
import { getPurchases } from "../controllers/purchaseController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/",authenticate,authorize("PHARMACY") ,getPurchases);

export default router;