import express from "express";
import { routeControllers } from "../controllers/routeControllers.js";
import adminMiddleware from "../middlewares/adminAuthMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

// Get Best Routes
router.post("/best-routes", authMiddleware, routeControllers.getBestRoutes);
router.post("/", authMiddleware, adminMiddleware, routeControllers.createRoute);
router.get("/", authMiddleware, adminMiddleware, routeControllers.getAllRoutes);
router.get("/:id", authMiddleware, adminMiddleware, routeControllers.getRouteById);
router.put("/:id", authMiddleware, adminMiddleware, routeControllers.updateRoute);
router.delete("/:id", authMiddleware, adminMiddleware, routeControllers.deleteRoute);

export default router;