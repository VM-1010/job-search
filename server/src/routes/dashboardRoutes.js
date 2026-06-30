import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { requireUser } from '../middleware/auth.js';
import { getUserDashboard } from '../controllers/dashboardController.js';

const router = Router();

// GET /api/dashboard
router.get('/', clerkMiddleware(), requireUser, getUserDashboard);

export default router;
