import express from 'express';
import { body, param } from 'express-validator';
import {
  createJob,
  editJob,
  deleteJob,
  closeJob,
  reopenJob,
  getRecruiterJobs,
  getJobs,
  getJobById
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const jobValidation = [
  body('title').notEmpty().withMessage('Job title is required').trim(),
  body('description').notEmpty().withMessage('Job description is required'),
  body('requirements').notEmpty().withMessage('Job requirements are required'),
  body('responsibilities').notEmpty().withMessage('Job responsibilities are required'),
  body('skills').optional().isArray().withMessage('Skills must be an array of strings'),
  body('salaryRange').optional().trim(),
  body('employmentType')
    .notEmpty()
    .withMessage('Employment type is required')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'])
    .withMessage('Employment type must be: Full-time, Part-time, Contract, Internship, or Temporary'),
  body('experienceLevel')
    .notEmpty()
    .withMessage('Experience level is required')
    .isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Manager', 'Executive'])
    .withMessage('Experience level must be: Entry Level, Mid Level, Senior Level, Lead / Manager, or Executive'),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('category').notEmpty().withMessage('Category is required').trim()
];

const jobUpdateValidation = [
  body('title').optional().notEmpty().withMessage('Job title cannot be empty').trim(),
  body('description').optional().notEmpty().withMessage('Job description cannot be empty'),
  body('requirements').optional().notEmpty().withMessage('Job requirements cannot be empty'),
  body('responsibilities').optional().notEmpty().withMessage('Job responsibilities cannot be empty'),
  body('skills').optional().isArray().withMessage('Skills must be an array of strings'),
  body('salaryRange').optional().trim(),
  body('employmentType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'])
    .withMessage('Employment type must be: Full-time, Part-time, Contract, Internship, or Temporary'),
  body('experienceLevel')
    .optional()
    .isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Manager', 'Executive'])
    .withMessage('Experience level must be: Entry Level, Mid Level, Senior Level, Lead / Manager, or Executive'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty').trim(),
  body('category').optional().notEmpty().withMessage('Category cannot be empty').trim()
];

const jobIdValidation = [
  param('id').isMongoId().withMessage('Invalid job ID format')
];

// Public search/view routes
router.get('/', getJobs);

// Recruiter specific list route (needs to be above /:id)
router.get('/my-jobs', protect, authorize('recruiter'), getRecruiterJobs);

// Job detail route
router.get('/:id', jobIdValidation, getJobById);

// Recruiter creation and edit routes
router.post('/', protect, authorize('recruiter'), jobValidation, createJob);
router.put('/:id', protect, authorize('recruiter'), jobIdValidation, jobUpdateValidation, editJob);
router.delete('/:id', protect, authorize('recruiter'), jobIdValidation, deleteJob);

// Status toggles
router.put('/:id/close', protect, authorize('recruiter'), jobIdValidation, closeJob);
router.put('/:id/reopen', protect, authorize('recruiter'), jobIdValidation, reopenJob);

export default router;
