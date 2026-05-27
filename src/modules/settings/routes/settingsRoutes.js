import express from "express";
import {
    getMySettings,
    updateMySettings,
} from "../controllers/settingsController.js";
import authenticate from "../../../middlewares/authenticate.js";

const router = express.Router();

router.get("/me", authenticate, getMySettings);
router.patch("/me", authenticate, updateMySettings);

export default router;
