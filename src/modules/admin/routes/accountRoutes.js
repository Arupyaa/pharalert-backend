import express from "express";
import {
    getAllAccounts,
    changeAccountStatus,
} from "../controllers/accountController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/accounts", authenticate, authorize("ADMIN"), getAllAccounts);
router.patch("/accounts/change-account-status/:id", authenticate, authorize("ADMIN"), changeAccountStatus);

export default router;
