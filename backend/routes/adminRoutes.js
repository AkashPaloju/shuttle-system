import { adminControllers } from '../controllers/adminControllers.js';
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Admin: Get all users
router.get('/users', authMiddleware, adminMiddleware, adminControllers.getUsers);

export default router;