import express from "express";
import { getCategories, createCategory } from "../controllers/categoryController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", authenticate, authorize("ADMIN"), createCategory);

export default router;
