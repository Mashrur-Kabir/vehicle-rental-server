import express from "express";
import auth from "../../middleware/auth";
import { bookingControllers } from "./booking.controller";

const router = express.Router();

router.post("/", auth("admin", "customer"), bookingControllers.createBooking);

router.get("/", auth("admin", "customer"), bookingControllers.getAllBookings);

router.get("/:bookingId", auth("admin"), bookingControllers.getSingleBooking);

router.put(
  "/:bookingId",
  auth("admin", "customer"),
  bookingControllers.updateBooking
);

router.delete("/:bookingId", auth("admin"), bookingControllers.deleteBooking);

export const bookingRoutes = router;
