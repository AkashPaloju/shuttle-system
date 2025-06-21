import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import stopRoutes from "./routes/stopRoutes.js";
import shuttleRoutes from "./routes/shuttleRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/stop", stopRoutes);
app.use("/api/shuttle", shuttleRoutes);
app.use("/api/route", routeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
