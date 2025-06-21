import express from "express";
import { shuttleControllers } from "../controllers/shuttleControllers.js";
const router = express.Router();
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminAuthMiddleware.js";

router.get("/", authMiddleware, shuttleControllers.getAllShuttles);
router.post("/", authMiddleware, adminMiddleware, shuttleControllers.createShuttle);
router.get("/:id", authMiddleware, shuttleControllers.getShuttleById);
router.put("/:id", authMiddleware, adminMiddleware, shuttleControllers.updateShuttle);
router.delete("/:id", authMiddleware, adminMiddleware, shuttleControllers.deleteShuttle);
router.patch("/:id/status", authMiddleware, adminMiddleware, shuttleControllers.updateShuttleStatus);
router.patch("/:id/occupancy", authMiddleware, shuttleControllers.updateShuttleOccupancy);

export default router;