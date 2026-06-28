import express from 'express';
import { body, param } from 'express-validator';
import {
  getProfile,
  updateHeadline,
  updateAbout,
  updateLocation,
  updateResume,
  updatePreferences,
  updateSocialLinks,
  updateProfilePicture,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addCertification,
  updateCertification,
  deleteCertification,
  addProject,
  updateProject,
  deleteProject,
  addSkill,
  updateSkill,
  deleteSkill,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  saveJob,
  removeSavedJob,
  getSavedJobs,
  getUserDashboard
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const textField = (fieldName) => body(fieldName).notEmpty().withMessage(`${fieldName} is required`).trim();

const optionalTextField = (fieldName) => body(fieldName).optional().trim();

const educationValidation = [
  body('school').notEmpty().withMessage('School is required').trim(),
  body('degree').optional().trim(),
  body('fieldOfStudy').optional().trim(),
  body('description').optional().trim(),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid')
];

const experienceValidation = [
  body('company').notEmpty().withMessage('Company is required').trim(),
  body('position').notEmpty().withMessage('Position is required').trim(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid'),
  body('current').optional().isBoolean().withMessage('Current must be a boolean')
];

const certificationValidation = [
  body('name').notEmpty().withMessage('Certification name is required').trim(),
  body('issuer').optional().trim(),
  body('credentialId').optional().trim(),
  body('credentialUrl').optional().trim(),
  body('issueDate').optional().isISO8601().withMessage('Issue date must be valid'),
  body('expirationDate').optional().isISO8601().withMessage('Expiration date must be valid')
];

const projectValidation = [
  body('title').notEmpty().withMessage('Project title is required').trim(),
  body('description').optional().trim(),
  body('link').optional().trim(),
  body('startDate').optional().isISO8601().withMessage('Start date must be valid'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid')
];

const skillValidation = [
  body('name').notEmpty().withMessage('Skill name is required').trim(),
  body('level').optional().trim()
];

const languageValidation = [
  body('language').notEmpty().withMessage('Language is required').trim(),
  body('proficiency').optional().trim()
];

const preferencesValidation = [
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

const socialLinksValidation = [
  body('socialLinks').optional().isObject().withMessage('Social links must be an object')
];

const savedJobValidation = [
  param('jobId').isMongoId().withMessage('Invalid job ID format')
];

const subdocIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

router.get('/profile', protect, authorize('seeker'), getProfile);
router.put('/profile/headline', protect, authorize('seeker'), [textField('headline')], updateHeadline);
router.put('/profile/about', protect, authorize('seeker'), [textField('about')], updateAbout);
router.put('/profile/location', protect, authorize('seeker'), [textField('location')], updateLocation);
router.put('/profile/resume', protect, authorize('seeker'), [textField('resume')], updateResume);
router.put('/profile/picture', protect, authorize('seeker'), [textField('profilePicture')], updateProfilePicture);
router.put('/profile/preferences', protect, authorize('seeker'), preferencesValidation, updatePreferences);
router.put('/profile/social-links', protect, authorize('seeker'), socialLinksValidation, updateSocialLinks);

router.post('/profile/education', protect, authorize('seeker'), educationValidation, addEducation);
router.put('/profile/education/:id', protect, authorize('seeker'), subdocIdValidation, educationValidation, updateEducation);
router.delete('/profile/education/:id', protect, authorize('seeker'), subdocIdValidation, deleteEducation);

router.post('/profile/experience', protect, authorize('seeker'), experienceValidation, addExperience);
router.put('/profile/experience/:id', protect, authorize('seeker'), subdocIdValidation, experienceValidation, updateExperience);
router.delete('/profile/experience/:id', protect, authorize('seeker'), subdocIdValidation, deleteExperience);

router.post('/profile/certifications', protect, authorize('seeker'), certificationValidation, addCertification);
router.put('/profile/certifications/:id', protect, authorize('seeker'), subdocIdValidation, certificationValidation, updateCertification);
router.delete('/profile/certifications/:id', protect, authorize('seeker'), subdocIdValidation, deleteCertification);

router.post('/profile/projects', protect, authorize('seeker'), projectValidation, addProject);
router.put('/profile/projects/:id', protect, authorize('seeker'), subdocIdValidation, projectValidation, updateProject);
router.delete('/profile/projects/:id', protect, authorize('seeker'), subdocIdValidation, deleteProject);

router.post('/profile/skills', protect, authorize('seeker'), skillValidation, addSkill);
router.put('/profile/skills/:id', protect, authorize('seeker'), subdocIdValidation, skillValidation, updateSkill);
router.delete('/profile/skills/:id', protect, authorize('seeker'), subdocIdValidation, deleteSkill);

router.post('/profile/languages', protect, authorize('seeker'), languageValidation, addLanguage);
router.put('/profile/languages/:id', protect, authorize('seeker'), subdocIdValidation, languageValidation, updateLanguage);
router.delete('/profile/languages/:id', protect, authorize('seeker'), subdocIdValidation, deleteLanguage);

router.get('/saved-jobs', protect, authorize('seeker'), getSavedJobs);
router.post('/saved-jobs/:jobId', protect, authorize('seeker'), savedJobValidation, saveJob);
router.delete('/saved-jobs/:jobId', protect, authorize('seeker'), savedJobValidation, removeSavedJob);

router.get('/dashboard', protect, authorize('seeker'), getUserDashboard);

export default router;