import express from "express";
import { bookingControllers } from "../controllers/bookingControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminAuthMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, bookingControllers.getUserBookings); // Get all bookings for the user
router.post("/", authMiddleware, bookingControllers.createBooking); // Create a new booking
router.post("/cancel", authMiddleware, bookingControllers.cancelBooking); // Cancel a booking

// Admin: Get user bookings
router.get("/admin/:userId", authMiddleware, adminMiddleware,
  (req, res, next) => {
    req.user.userId = req.params.userId;
    next();
  },
  bookingControllers.getUserBookings); // Get all bookings for the user (admin view)

export default router;