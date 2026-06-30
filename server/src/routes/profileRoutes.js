import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { requireUser } from '../middleware/auth.js';
import { getProfile, upsertProfile } from '../controllers/profileController.js';

const router = Router();

// GET /api/profile     — retrieve own profile
// PUT /api/profile     — create or update profile
router.get('/', clerkMiddleware(), requireUser, getProfile);
router.put('/', clerkMiddleware(), requireUser, upsertProfile);

export default router;
