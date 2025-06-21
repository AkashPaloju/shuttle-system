import Route from "../models/Route.js";
import Stop from "../models/Stop.js";
import Shuttle from "../models/Shuttle.js";
import User from "../models/User.js";
import { calculateFare, calculateArrivalTimeAtStop, calculateTravelTime } from "../utils/fareAndTimeCalculator.js";

// Get routes according to the selected source and destination stops by the user
const getBestRoutes = async (req, res) => {
  try {
    const { source, destination } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ msg: "Source and destination are required" });
    }

    // Find all routes containing both source and destination stops
    const routes = await Route.find({ stops: { $all: [source, destination] } })
      .populate('stops')
      .sort({ name: 1 });

    if (!routes || routes.length === 0) {
      return res.status(404).json({ msg: "No routes found for the selected stops" });
    }

    const matchedRoutes = [];

    for (const route of routes) {
      const stopIds = route.stops.map(stop => stop._id.toString());
      const sourceIndex = stopIds.indexOf(source);
      const destIndex = stopIds.indexOf(destination);

      if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
        continue; // invalid route order
      }

      const shuttle = await Shuttle.findOne({ currentRoute: route._id });
      if (!shuttle || !shuttle.active || (shuttle.capacity === shuttle.occupancy)) continue;

      const estimatedTime = calculateTravelTime(route, source, destination);
      const fare = calculateFare(route, source, destination);
      const arrivalTime = calculateArrivalTimeAtStop(route, source).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (fare === null || estimatedTime === null || arrivalTime === null) {
        continue; // invalid fare or time calculation
      }

      matchedRoutes.push({
        routeId: route._id,
        routeName: route.name,
        shuttleNumber: shuttle.shuttleNumber,
        allStops: route.stops.map(stop => ({
          _id: stop._id,
          name: stop.name
        })),
        fare,
        estimatedTime: `${estimatedTime} mins`,
        arrivalTime: arrivalTime,
        availableSeats: `${shuttle.capacity - shuttle.occupancy}/${shuttle.capacity}`,
      });
    }

    if (matchedRoutes.length === 0) {
      return res.status(404).json({ msg: "No valid routes found in correct stop order" });
    }

    res.json({ bestRoutes: matchedRoutes });

  } catch (err) {
    console.error("Error fetching best routes:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Create a new route
const createRoute = async (req, res) => {
  try {
    const { name, stops, timingSlots, optimizedFor } = req.body;
    const universityId = req.universityId; // from admin middleware

    if (!name || !stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ msg: "Please provide route name and at least 2 stops" });
    }

    if (!timingSlots || !Array.isArray(timingSlots) || timingSlots.length === 0) {
      return res.status(400).json({ msg: "Please provide at least one timing slot" });
    }

    // Validate timing slots
    for (const slot of timingSlots) {
      if (!slot.startTime || !slot.endTime || !slot.days || !Array.isArray(slot.days) || slot.days.length === 0) {
        return res.status(400).json({ msg: "Each timing slot must have startTime, endTime, and days" });
      }
    }

    // Check if route with same name exists
    const existingRoute = await Route.findOne({ name, universityId });
    if (existingRoute) {
      return res.status(400).json({ msg: "Route with this name already exists" });
    }

    // Verify all stops exist and belong to the university
    const stopObjects = await Stop.find({ 
      _id: { $in: stops }, 
      universityId 
    });
    
    if (stopObjects.length !== stops.length) {
      return res.status(400).json({ msg: "One or more stops not found or don't belong to your university" });
    }

    const route = await Route.create({
      name,
      stops,
      timingSlots,
      optimizedFor: optimizedFor || [],
      universityId
    });

    res.status(201).json({ msg: "Route created successfully", route });

  } catch (err) {
    console.error("Error creating route:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Get all routes for admin
const getAllRoutes = async (req, res) => {
  try {
    const universityId = req.universityId; // from admin middleware

    const routes = await Route.find({ universityId })
      .populate('stops', 'name location campusZone')
      .sort({ name: 1 });

    if (!routes || routes.length === 0) {
      return res.status(404).json({ msg: "No routes found for this university" });
    }

    res.json({ routes });

  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Get route by ID
const getRouteById = async (req, res) => {
  try {
    const routeId = req.params.id;
    const universityId = req.universityId; // from admin middleware

    const route = await Route.findOne({ _id: routeId, universityId })
      .populate('stops', 'name location campusZone');

    if (!route) {
      return res.status(404).json({ msg: "Route not found" });
    }

    res.json({ route });

  } catch (err) {
    console.error("Error fetching route:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Update route
const updateRoute = async (req, res) => {
  try {
    const routeId = req.params.id;
    const { name, stops, timingSlots, optimizedFor } = req.body;
    const universityId = req.universityId; // from admin middleware

    if (!name || !stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ msg: "Please provide route name and at least 2 stops" });
    }

    if (!timingSlots || !Array.isArray(timingSlots) || timingSlots.length === 0) {
      return res.status(400).json({ msg: "Please provide at least one timing slot" });
    }

    // Validate timing slots
    for (const slot of timingSlots) {
      if (!slot.startTime || !slot.endTime || !slot.days || !Array.isArray(slot.days) || slot.days.length === 0) {
        return res.status(400).json({ msg: "Each timing slot must have startTime, endTime, and days" });
      }
    }

    // Verify all stops exist and belong to the university
    const stopObjects = await Stop.find({ 
      _id: { $in: stops }, 
      universityId 
    });
    
    if (stopObjects.length !== stops.length) {
      return res.status(400).json({ msg: "One or more stops not found or don't belong to your university" });
    }

    const route = await Route.findOneAndUpdate(
      { _id: routeId, universityId },
      {
        name,
        stops,
        timingSlots,
        optimizedFor: optimizedFor || []
      },
      { new: true }
    ).populate('stops', 'name location campusZone');

    if (!route) {
      return res.status(404).json({ msg: "Route not found" });
    }

    res.json({ msg: "Route updated successfully", route });

  } catch (err) {
    console.error("Error updating route:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Delete route
const deleteRoute = async (req, res) => {
  try {
    const routeId = req.params.id;
    const universityId = req.universityId; // from admin middleware

    // Check if any shuttle is currently assigned to this route
    const shuttleOnRoute = await Shuttle.findOne({ currentRoute: routeId });
    if (shuttleOnRoute) {
      return res.status(400).json({ 
        msg: "Cannot delete route. A shuttle is currently assigned to this route. Please reassign the shuttle first." 
      });
    }

    const route = await Route.findOneAndDelete({ _id: routeId, universityId });
    if (!route) {
      return res.status(404).json({ msg: "Route not found" });
    }

    res.json({ msg: "Route deleted successfully" });

  } catch (err) {
    console.error("Error deleting route:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const routeControllers = {
  getBestRoutes,
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
};