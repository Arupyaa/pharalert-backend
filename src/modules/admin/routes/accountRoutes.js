import express from "express";
import { getAllAccounts } from "../controllers/accountController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/accounts", authenticate, authorize("ADMIN"), getAllAccounts);

export default router;
