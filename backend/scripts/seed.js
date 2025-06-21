import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

// Load models
import University from '../models/University.js';
import User from '../models/User.js';
import Stop from '../models/Stop.js';
import Route from '../models/Route.js';
import Shuttle from '../models/Shuttle.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

// Cleanup old data (optional for dev)
await Promise.all([
  University.deleteMany(),
  User.deleteMany(),
  Stop.deleteMany(),
  Route.deleteMany(),
  Shuttle.deleteMany(),
  Booking.deleteMany(),
  Transaction.deleteMany(),
]);

console.log("Old data cleared ✅");

// 1. Create University
const university = await University.create({
  universityId: 'IIITJ',
  universityName: 'IIIT Jabalpur',
  universityLocation: 'Jabalpur, Madhya Pradesh, India',
  universityDomain: 'iiitdmj.ac.in',
  universityAdminEmails: ['admin@iiitdmj.ac.in'],
});

// 2. Create Stops
const stops = await Stop.insertMany([
  { name: 'Dorm A', location: { lat: 23.1, lng: 79.9 }, campusZone: 'Hostel', universityId: university._id },
  { name: 'Library', location: { lat: 23.2, lng: 79.91 }, campusZone: 'Academic', universityId: university._id },
  { name: 'Admin Block', location: { lat: 23.21, lng: 79.93 }, campusZone: 'Admin', universityId: university._id },
]);

// 3. Create Route
const route = await Route.create({
  name: 'Morning Route A',
  stops: stops.map(stop => stop._id),
  timingSlots: [
    { startTime: '08:00', endTime: '09:00', days: ['Mon', 'Tue', 'Wed'] }
  ],
  optimizedFor: ['Peak Hour'],
});

// 4. Create Shuttle
const shuttle = await Shuttle.create({
  shuttleNumber: 'SH-101',
  capacity: 20,
  currentRoute: route._id,
  currentLocation: 'Dorm A',
});

// 5. Create Admin & Student Users
const adminPassword = await bcrypt.hash('123456789', 10);
const studentPassword = await bcrypt.hash('123456789', 10);

const admin = await User.create({
  name: 'Admin User',
  email: 'admin@iiitdmj.ac.in',
  password: adminPassword,
  universityId: university._id,
  role: 'admin',
});

const student = await User.create({
  name: 'Akash Paloju',
  email: '22bcs179@iiitdmj.ac.in',
  password: studentPassword,
  universityId: university._id,
  role: 'student',
  walletBalance: 500,
});

// 6. Create Transactions
await Transaction.create([
  {
    userId: student._id,
    amount: 500,
    type: 'credit',
    paymentMethod: 'upi',
    description: 'Initial wallet top-up',
    status: 'success',
  },
  {
    userId: student._id,
    amount: 30,
    type: 'debit',
    paymentMethod: 'wallet',
    description: 'Ride from Dorm A to Library',
    status: 'success',
  }
]);

// 7. Create Booking
await Booking.create({
  userId: student._id,
  shuttleId: shuttle._id,
  routeId: route._id,
  sourceStopId: stops[0]._id,
  destinationStopId: stops[1]._id,
  fare: 30,
  bookingTime: new Date(),
  rideStartTime: new Date(),
  rideEndTime: new Date(),
  status: 'completed',
});

const university2 = await University.create({
  universityId: 'IIT KGP',
  universityName: 'IIT Kharagpur',
  universityLocation: 'Kharagpur, West Bengal, India',
  universityDomain: 'iitkgp.ac.in',
  universityAdminEmails: ['admin@iitkgp.ac.in'],
});
const admin2 = await User.create({
  name: 'Admin KGP',
  email: 'admin@iitkgp.ac.in',
  password: adminPassword,
  universityId: university2._id,
  role: 'admin',
});
const student2 = await User.create({
  name: 'Nishanth',
  email: '22bcs100@iitkgp.ac.in',
  password: studentPassword,
  universityId: university2._id,
  role: 'student',
  walletBalance: 500,
});

console.log("✅ Seeding completed successfully!");

process.exit();
