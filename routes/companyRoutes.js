import express from 'express';
import { body, param } from 'express-validator';
import {
  createCompany,
  getCompany,
  updateCompany,
  listCompanies,
  getCompanyJobs
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const companyValidation = [
  body('companyName').notEmpty().withMessage('Company name is required').trim(),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be a valid email address').normalizeEmail(),
  body('foundedYear').optional().isInt({ min: 1700, max: new Date().getFullYear() }).withMessage('Founded year must be a valid year'),
  body('companySize').optional().trim()
];

const companyUpdateValidation = [
  body('companyName').optional().notEmpty().withMessage('Company name cannot be empty').trim(),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be a valid email address').normalizeEmail(),
  body('foundedYear').optional().isInt({ min: 1700, max: new Date().getFullYear() }).withMessage('Founded year must be a valid year'),
  body('companySize').optional().trim()
];

const companyIdValidation = [
  param('id').isMongoId().withMessage('Invalid company ID format')
];

router.post('/', protect, authorize('recruiter'), companyValidation, createCompany);
router.get('/', listCompanies);
router.get('/:id', companyIdValidation, getCompany);
router.put('/:id', protect, authorize('recruiter'), companyIdValidation, companyUpdateValidation, updateCompany);
router.get('/:id/jobs', companyIdValidation, getCompanyJobs);

export default router;
