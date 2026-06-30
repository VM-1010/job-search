import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { syncUser } from '../controllers/userController.js';

const router = Router();

// POST /api/auth/sync
// Called once after Clerk login to create/retrieve the MongoDB document
router.post('/sync', clerkMiddleware(), syncUser);

export default router;
