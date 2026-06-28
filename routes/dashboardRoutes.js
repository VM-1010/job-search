import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getRecruiterDashboard, getUserDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/user', protect, authorize('seeker'), getUserDashboard);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterDashboard);

export default router;