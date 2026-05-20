import express from "express";
import {
    createReservation,
    deleteReservation,
    getUserReservations,
} from "../controllers/reservationController.js";
import authenticate from "../../../../middlewares/authenticate.js";
import authorize from "../../../../middlewares/authorize.js";

const router = express.Router();

router.get("/", authenticate, authorize("PAID_USER"), getUserReservations);
router.post("/", authenticate, authorize("PAID_USER"), createReservation);
router.delete("/:id", authenticate, authorize("PAID_USER"), deleteReservation);

export default router;
