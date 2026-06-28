import express from 'express';
import { body } from 'express-validator';
import {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const applyValidation = [
  body('jobId').notEmpty().withMessage('Job ID is required').isMongoId().withMessage('Invalid job ID format'),
  body('coverLetter').optional().trim()
];

const statusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Accepted'])
    .withMessage('Invalid application status')
];

// Seeker routes
router.post('/', protect, authorize('seeker'), applyValidation, applyToJob);
router.get('/my-applications', protect, authorize('seeker'), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', protect, authorize('recruiter'), getApplicantsForJob);
router.put('/:id/status', protect, authorize('recruiter'), statusValidation, updateApplicationStatus);

export default router;
