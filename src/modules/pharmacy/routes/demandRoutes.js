import express from "express";

import createDemand from "../controllers/demandController.js";

import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.post("/",authenticate,authorize("PHARMACY"),createDemand);

export default router;