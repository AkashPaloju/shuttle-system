import mongoose from 'mongoose';
import User from '../models/User.js';
import Route from '../models/Route.js';
import Shuttle from '../models/Shuttle.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import { calculateFare, calculateArrivalTimeAtStop, calculateTravelTime } from '../utils/fareAndTimeCalculator.js';

// Create a booking
const createBooking = async (req, res) => {
  // const session = await mongoose.startSession();

  try {
    const { sourceStopId, destinationStopId, routeId } = req.body;
    const userId = req.user.userId;

    if (!sourceStopId || !destinationStopId || !routeId || sourceStopId === destinationStopId) {
      return res.status(400).json({ msg: "Invalid source, destination or route" });
    }

    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ msg: "Route not found" });

    const stopIds = route.stops.map(id => id.toString());
    const srcIndex = stopIds.indexOf(sourceStopId);
    const dstIndex = stopIds.indexOf(destinationStopId);

    if (srcIndex === -1 || dstIndex === -1 || srcIndex >= dstIndex)
      return res.status(400).json({ msg: "Invalid stop order for selected route" });

    const shuttle = await Shuttle.findOne({ currentRoute: route._id });
    if (!shuttle)
      return res.status(400).json({ msg: "No shuttle available on selected route" });

    const fare = calculateFare(route, sourceStopId, destinationStopId);
    const estimatedTime = calculateTravelTime(route, sourceStopId, destinationStopId);
    const arrivalTime = calculateArrivalTimeAtStop(route, sourceStopId);
    const departureTime = calculateArrivalTimeAtStop(route, destinationStopId);
    
    const user = await User.findById(userId);
    if (!user || user.walletBalance < fare)
      return res.status(400).json({ msg: "Insufficient wallet balance" });

    // Todo: Implement transaction handling
    // await session.withTransaction(async () => {
    //   user.walletBalance -= fare;
    //   await user.save({ session });

    //   await Transaction.create([{
    //     userId,
    //     amount: fare,
    //     type: 'debit',
    //     paymentMethod: 'wallet',
    //     description: 'Booking fare',
    //     status: 'success',
    //   }], { session });

    //   await Booking.create([{
    //     userId,
    //     shuttleId: shuttle._id,
    //     routeId: route._id,
    //     sourceStop: sourceStopId,
    //     destinationStop: destinationStopId,
    //     fare,
    //     status: 'booked',
    //     bookingTime: new Date(),
    //   }], { session });
    // });
    // await session.endSession();

    user.walletBalance -= fare;
    await user.save();
    shuttle.occupancy += 1; // Increment shuttle occupancy
    await shuttle.save();
    await Transaction.create({
      userId,
      amount: fare,
      type: 'debit',
      paymentMethod: 'wallet',
      description: 'Booking fare',
      status: 'success',
    });
    await Booking.create({
      userId,
      shuttleId: shuttle._id,
      routeId: route._id,
      sourceStopId,
      destinationStopId,
      fare,
      bookingTime: new Date(),
      rideStartTime: arrivalTime,
      rideEndTime: departureTime,
    });

    res.status(201).json({
      message: "Ride booked successfully!",
      fare,
      estimatedTime: `${estimatedTime} mins`,
    });

  } catch (err) {
    console.error("Booking Error:", err);
    // await session.abortTransaction();
    // await session.endSession();
    res.status(500).json({ msg: "Booking failed." });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.body.bookingId;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.status !== 'upcoming') {
      return res.status(400).json({ msg: "Only upcoming rides can be cancelled" });
    }
    booking.status = 'cancelled';
    await booking.save();

    const shuttle = await Shuttle.findById(booking.shuttleId);
    shuttle.occupancy -= 1;
    await shuttle.save();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.walletBalance += booking.fare;
    await user.save();

    await Transaction.create({
      userId,
      amount: booking.fare,
      type: 'credit',
      paymentMethod: 'wallet',
      description: 'Booking cancellation refund',
      status: 'success',
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};


// Get all bookings for the current user, with populated shuttle, route, and stop names
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate({ path: "shuttleId", select: "shuttleNumber" })
      .populate({ path: "routeId", select: "name" })
      .populate({ path: "sourceStopId", select: "name" })
      .populate({ path: "destinationStopId", select: "name" });
    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const getUpcomingBookings = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const bookings = await Booking.find({ userId, status: 'upcoming' })
      .sort({ rideStartTime: 1 }) // Sort by ride start time
      .populate({ path: "shuttleId", select: "shuttleNumber" })
      .populate({ path: "routeId", select: "name" })
      .populate({ path: "sourceStopId", select: "name" })
      .populate({ path: "destinationStopId", select: "name" });
    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching upcoming bookings:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const bookingControllers = {
  createBooking,
  cancelBooking,
  getUserBookings,
  getUpcomingBookings
};
