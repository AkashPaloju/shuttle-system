import Shuttle from "../models/Shuttle.js";
import mongoose from "mongoose";

const getAllShuttles = async (req, res) => {
  try {
    const universityId = req.universityId; // from admin middleware

    const shuttles = await Shuttle.find({ universityId: universityId })
      .populate('currentRoute', 'name')
      .sort({ shuttleNumber: 1 });

    if (!shuttles || shuttles.length === 0) {
      return res.status(404).json({ msg: "No shuttles found for this university" });
    }

    res.json({ shuttles });

  } catch (err) {
    console.error("Error fetching shuttles:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const getShuttleById = async (req, res) => {
  try {
    const shuttleId = req.params.id;
    const universityId = req.universityId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(shuttleId)) {
      return res.status(400).json({ msg: "Invalid shuttle ID" });
    }

    const shuttle = await Shuttle.findOne({ 
      _id: shuttleId, 
      universityId: universityId 
    }).populate('currentRoute', 'name stops');

    if (!shuttle) {
      return res.status(404).json({ msg: "Shuttle not found" });
    }

    res.json({ shuttle });

  } catch (err) {
    console.error("Error fetching shuttle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const createShuttle = async (req, res) => {
  try {
    const { shuttleNumber, capacity, currentRoute, active, currentLocation } = req.body;
    const universityId = req.universityId;

    // Validation
    if (!shuttleNumber || !capacity) {
      return res.status(400).json({ msg: "Shuttle number and capacity are required" });
    }

    if (capacity <= 0) {
      return res.status(400).json({ msg: "Capacity must be greater than 0" });
    }

    // Check if shuttle already exists
    const existingShuttle = await Shuttle.findOne({ shuttleNumber, universityId });
    if (existingShuttle) {
      return res.status(400).json({ msg: "Shuttle with this number already exists" });
    }

    // Validate currentRoute if provided
    if (currentRoute && !mongoose.Types.ObjectId.isValid(currentRoute)) {
      return res.status(400).json({ msg: "Invalid route ID" });
    }

    // Create new shuttle
    const shuttleData = {
      shuttleNumber,
      capacity,
      universityId,
      active: active !== undefined ? active : true,
      occupancy: 0
    };

    if (currentRoute) shuttleData.currentRoute = currentRoute;
    if (currentLocation) shuttleData.currentLocation = currentLocation;

    const newShuttle = new Shuttle(shuttleData);
    await newShuttle.save();

    res.status(201).json({ 
      msg: "Shuttle created successfully", 
      shuttle: newShuttle 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Shuttle number already exists" });
    }
    console.error("Error creating shuttle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const updateShuttle = async (req, res) => {
  try {
    const shuttleId = req.params.id;
    const universityId = req.universityId;
    const { shuttleNumber, capacity, currentRoute, active, currentLocation, occupancy } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(shuttleId)) {
      return res.status(400).json({ msg: "Invalid shuttle ID" });
    }

    // Validation
    if (capacity && capacity <= 0) {
      return res.status(400).json({ msg: "Capacity must be greater than 0" });
    }

    if (occupancy && occupancy < 0) {
      return res.status(400).json({ msg: "Occupancy cannot be negative" });
    }

    // Validate currentRoute if provided
    if (currentRoute && !mongoose.Types.ObjectId.isValid(currentRoute)) {
      return res.status(400).json({ msg: "Invalid route ID" });
    }

    // Build update object
    const updateData = {};
    if (shuttleNumber) updateData.shuttleNumber = shuttleNumber;
    if (capacity) updateData.capacity = capacity;
    if (currentRoute) updateData.currentRoute = currentRoute;
    if (active !== undefined) updateData.active = active;
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (occupancy !== undefined) updateData.occupancy = occupancy;

    // Find and update shuttle (ensure it belongs to the university)
    const updatedShuttle = await Shuttle.findOneAndUpdate(
      { _id: shuttleId, universityId: universityId },
      updateData,
      { new: true, runValidators: true }
    ).populate('currentRoute', 'name');

    if (!updatedShuttle) {
      return res.status(404).json({ msg: "Shuttle not found" });
    }

    res.json({ 
      msg: "Shuttle updated successfully", 
      shuttle: updatedShuttle 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Shuttle number already exists" });
    }
    console.error("Error updating shuttle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const deleteShuttle = async (req, res) => {
  try {
    const shuttleId = req.params.id;
    const universityId = req.universityId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(shuttleId)) {
      return res.status(400).json({ msg: "Invalid shuttle ID" });
    }

    // Find and delete shuttle (ensure it belongs to the university)
    const deletedShuttle = await Shuttle.findOneAndDelete({
      _id: shuttleId,
      universityId: universityId
    });

    if (!deletedShuttle) {
      return res.status(404).json({ msg: "Shuttle not found" });
    }

    res.json({ msg: "Shuttle deleted successfully" });

  } catch (err) {
    console.error("Error deleting shuttle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Additional useful endpoints
const updateShuttleStatus = async (req, res) => {
  try {
    const shuttleId = req.params.id;
    const universityId = req.universityId;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shuttleId)) {
      return res.status(400).json({ msg: "Invalid shuttle ID" });
    }

    const updatedShuttle = await Shuttle.findOneAndUpdate(
      { _id: shuttleId, universityId: universityId },
      { active },
      { new: true }
    );

    if (!updatedShuttle) {
      return res.status(404).json({ msg: "Shuttle not found" });
    }

    res.json({ 
      msg: `Shuttle ${active ? 'activated' : 'deactivated'} successfully`, 
      shuttle: updatedShuttle 
    });

  } catch (err) {
    console.error("Error updating shuttle status:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

const updateShuttleOccupancy = async (req, res) => {
  try {
    const shuttleId = req.params.id;
    const universityId = req.universityId;
    const { occupancy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shuttleId)) {
      return res.status(400).json({ msg: "Invalid shuttle ID" });
    }

    if (occupancy < 0) {
      return res.status(400).json({ msg: "Occupancy cannot be negative" });
    }

    const shuttle = await Shuttle.findOne({ _id: shuttleId, universityId });
    if (!shuttle) {
      return res.status(404).json({ msg: "Shuttle not found" });
    }

    if (occupancy > shuttle.capacity) {
      return res.status(400).json({ msg: "Occupancy cannot exceed capacity" });
    }

    shuttle.occupancy = occupancy;
    await shuttle.save();

    res.json({ 
      msg: "Shuttle occupancy updated successfully", 
      shuttle 
    });

  } catch (err) {
    console.error("Error updating shuttle occupancy:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const shuttleControllers = {
  getAllShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  deleteShuttle,
  updateShuttleStatus,
  updateShuttleOccupancy
};