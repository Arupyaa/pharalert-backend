import express from "express";
import {
    getMySettings,
    updateMySettings,
} from "../controllers/settingsController.js";
import {
    requestOtp,
    confirmChangePassword,
} from "../controllers/changePasswordController.js";
import authenticate from "../../../middlewares/authenticate.js";

const router = express.Router();

router.get("/me", authenticate, getMySettings);
router.patch("/me", authenticate, updateMySettings);
router.post("/change-password/request-otp", authenticate, requestOtp);
router.post("/change-password/confirm", authenticate, confirmChangePassword);

export default router;
