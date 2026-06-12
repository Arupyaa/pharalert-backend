import express from "express";

import { createOrder } from "../controllers/orderController.js";

import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.post("/", authenticate, authorize("PHARMACY"), createOrder);

export default router;
