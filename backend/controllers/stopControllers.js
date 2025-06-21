import { get } from "mongoose";
import Stop from "../models/Stop.js";
import User from "../models/User.js";


// Get all stops available in the university of the logged-in user
const getAllStops = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const user = await User.findById(userId);
    const stops = await Stop.find({ universityId: user.universityId }).sort({ name: 1 });

    if (!stops || stops.length === 0) {
      return res.status(404).json({ msg: "No stops found for this university" });
    }

    res.json({ stops });

  } catch (err) {
    console.error("Error fetching stops:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const getStopById = async (req, res) => {
  try {
    const stopId = req.params.id;
    const stop = await Stop.findOne({ _id: stopId });
    if (!stop) {
      return res.status(404).json({ msg: "Stop not found" });
    }

    res.json({ stop });

  } catch (err) {
    console.error("Error fetching stop:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const createStop = async (req, res) => {
  try {
    const { name, location, campusZone } = req.body;
    const universityId = req.universityId; // from admin middleware

    if (!name || !location.lat || !location.lng || !campusZone) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }
    // Check if stop already with the same name or location exists
    const existingStopWithName = await Stop.findOne({
      name,
      universityId
    });
    const existingStopWithLocation = await Stop.findOne({
      location
    });
    if (existingStopWithName || existingStopWithLocation) {
      return res.status(400).json({ msg: "Stop already exists" });
    }

    await Stop.create({
      name,
      location,
      campusZone,
      universityId
    });

    res.status(201).json({ msg: "Stop created successfully" });

  } catch (err) {
    console.error("Error creating stop:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const deleteStop = async (req, res) => {
  try {
    const stopId = req.params.id;
    const universityId = req.universityId; // from admin middleware

    const stop = await Stop.findOneAndDelete({ _id: stopId, universityId });
    if (!stop) {
      return res.status(404).json({ msg: "Stop not found" });
    }

    res.json({ msg: "Stop deleted successfully" });

  } catch (err) {
    console.error("Error deleting stop:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const updateStop = async (req, res) => {
  try {
    const stopId = req.params.id;
    const { name, location, campusZone } = req.body;
    const universityId = req.universityId; // from admin middleware

    if (!name || !location.lat || !location.lng || !campusZone) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    console.log("Updating stop with ID:", stopId, "for university ID:", universityId);
    console.log("New stop details:", { name, location, campusZone });

    const stop = await Stop.findOneAndUpdate(
      { _id: stopId, universityId },
      { name, location, campusZone },
      { new: true }
    );

    if (!stop) {
      return res.status(404).json({ msg: "Stop not found" });
    }

    res.json({ msg: "Stop updated successfully", stop });

  } catch (err) {
    console.error("Error updating stop:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};



export const stopControllers = {
  createStop,
  deleteStop,
  updateStop,
  getStopById,
  getAllStops
};