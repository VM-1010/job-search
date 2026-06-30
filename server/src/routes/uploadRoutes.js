import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { requireUser } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadResume } from '../controllers/uploadController.js';

const router = Router();

// POST /api/upload/resume — upload a single PDF resume
router.post('/resume', clerkMiddleware(), requireUser, upload.single('resume'), uploadResume);

export default router;
