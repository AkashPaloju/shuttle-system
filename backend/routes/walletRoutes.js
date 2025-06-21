import express from "express";
import { walletControllers } from "../controllers/walletControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Get current user's wallet balance and transactions
router.get("/get", authMiddleware, walletControllers.getWallet);

// Recharge wallet (student)
router.post("/recharge", authMiddleware, walletControllers.rechargeWallet);

// Admin: assign or adjust points for a user
router.put("/update", authMiddleware, adminMiddleware, walletControllers.updateWalletBalance);

// Admin: change wallet balance for all students
router.put("/update-all", authMiddleware, adminMiddleware, walletControllers.updateWalletBalanceToAllStudents);

// Get wallet statement/expense report (student)
router.get("/statement", authMiddleware, walletControllers.getWalletStatement);

// Admin: get all users' wallets (optional)
router.get("/all", authMiddleware, adminMiddleware, walletControllers.getAllWallets);

export default router;
