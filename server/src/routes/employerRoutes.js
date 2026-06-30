import { Router } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { requireEmployer } from '../middleware/employerAuth.js';
import { getEmployerDashboard } from '../controllers/dashboardController.js';
import {
  getEmployerJobs,
  getEmployerJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import {
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { getCompanyProfile, upsertCompanyProfile } from '../controllers/companyProfileController.js';
import { getApplicantProfile } from '../controllers/profileController.js';

const router = Router();

// All employer routes require Clerk auth + employer middleware
router.use(clerkMiddleware(), requireEmployer);

// Dashboard
// GET /api/emp/dashboard
router.get('/dashboard', getEmployerDashboard);

// Company Profile
// GET /api/emp/profile
// PUT /api/emp/profile
router.get('/profile', getCompanyProfile);
router.put('/profile', upsertCompanyProfile);

// View an applicant's user profile
// GET /api/emp/profile/:userId
router.get('/profile/:userId', getApplicantProfile);

// Job Listings
// GET    /api/emp/jobs
// POST   /api/emp/jobs
// GET    /api/emp/jobs/:id
// PUT    /api/emp/jobs/:id
// DELETE /api/emp/jobs/:id
router.get('/jobs', getEmployerJobs);
router.post('/jobs', createJob);
router.get('/jobs/:id', getEmployerJobById);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

// Applications for a specific job
// GET /api/emp/jobs/:id/applications
router.get('/jobs/:id/applications', getJobApplications);

// Update application status
// PUT /api/emp/applications/:id
router.put('/applications/:id', updateApplicationStatus);

export default router;
