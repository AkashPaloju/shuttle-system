import express from "express";
import { stopControllers } from "../controllers/stopControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminAuthMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, stopControllers.getAllStops);
router.post("/", authMiddleware, adminMiddleware, stopControllers.createStop);
router.get("/:id", authMiddleware, stopControllers.getStopById);
router.put("/:id", authMiddleware, adminMiddleware, stopControllers.updateStop);
router.delete("/:id", authMiddleware, adminMiddleware, stopControllers.deleteStop);

export default router;