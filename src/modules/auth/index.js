import express from "express";
import authRoutes from "./routes/authRoutes.js";
// import loginRoute from "./routes/loginRoute";
// import logoutRoute from "./routes/logoutRoute";
const router = express.Router();

// router.use("/login", loginRoute);
// router.use("/logout", logoutRoute);
router.use("/", authRoutes);

export default router;