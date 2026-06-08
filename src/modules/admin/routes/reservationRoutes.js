import express from "express";
import {
    getAllReservations,
    updateReservationStatus,
} from "../controllers/reservationController.js";
import authenticate from "../../../middlewares/authenticate.js";
import authorize from "../../../middlewares/authorize.js";

const router = express.Router();

router.get("/reservations", authenticate, authorize("ADMIN"), getAllReservations);
router.patch("/reservations", authenticate, authorize("ADMIN"), updateReservationStatus);

export default router;
