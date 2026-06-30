import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { requireUser } from '../middleware/auth.js';
import { getAllJobs, getJobById } from '../controllers/jobController.js';

const router = Router();

// GET /api/jobs        — all jobs with optional filters (public but user token attached for convenience)
// GET /api/jobs/:id   — single job detail
router.get('/', clerkMiddleware(), requireUser, getAllJobs);
router.get('/:id', clerkMiddleware(), requireUser, getJobById);

export default router;
