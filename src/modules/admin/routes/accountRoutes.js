import express from "express";
import {
    getAllAccounts,
    changeAccountStatus,
    changeUserType,
} from "../controllers/accountController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/accounts", authenticate, authorize("ADMIN"), getAllAccounts);
router.patch("/accounts/change-account-status/:id", authenticate, authorize("ADMIN"), changeAccountStatus);
router.patch("/accounts/change-user-type/:id", authenticate, authorize("ADMIN"), changeUserType);

export default router;
