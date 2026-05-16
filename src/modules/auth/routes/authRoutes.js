import express from "express";
import { loginUser, logoutUser, registerUser, registerPharmacy, registerCompany } from "../controllers/authController.js";
import authenticate from "../../../middlewares/authenticate.js";
const router = express.Router();

//registeration routes
router.post(
    "/register/user", registerUser
);

router.post(
    "/register/pharmacy", registerPharmacy
);

router.post(
    "/register/company", registerCompany
);

router.post("/login", loginUser);
router.post("/logout", logoutUser);
export default router;