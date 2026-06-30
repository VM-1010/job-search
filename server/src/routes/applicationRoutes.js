import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { requireUser } from '../middleware/auth.js';
import {
  getMyApplications,
  applyToJob,
  deleteApplication,
} from '../controllers/applicationController.js';

const router = Router();

// GET    /api/applications     — list user's applications
// POST   /api/applications     — apply to a job
// DELETE /api/applications/:id — remove an application
router.get('/', clerkMiddleware(), requireUser, getMyApplications);
router.post('/', clerkMiddleware(), requireUser, applyToJob);
router.delete('/:id', clerkMiddleware(), requireUser, deleteApplication);

export default router;
