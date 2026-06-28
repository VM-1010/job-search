import { validationResult } from 'express-validator';
import Company from '../models/companyModel.js';
import Recruiter from '../models/recruiterModel.js';
import Job from '../models/jobModel.js';

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (Recruiter only)
export const createCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if recruiter is already associated with a company
    const recruiter = await Recruiter.findById(req.user._id);
    if (recruiter.company) {
      return res.status(400).json({
        message: 'Recruiter is already associated with a company'
      });
    }

    const {
      companyName,
      logo,
      banner,
      description,
      industry,
      headquarters,
      website,
      foundedYear,
      companySize,
      contactEmail,
      socialLinks
    } = req.body;

    const company = await Company.create({
      companyName,
      logo: logo || '',
      banner: banner || '',
      description: description || '',
      industry: industry || '',
      headquarters: headquarters || '',
      website: website || '',
      foundedYear,
      companySize: companySize || '',
      contactEmail: contactEmail || '',
      socialLinks: {
        linkedin: (socialLinks && socialLinks.linkedin) || '',
        twitter: (socialLinks && socialLinks.twitter) || '',
        facebook: (socialLinks && socialLinks.facebook) || ''
      },
      recruiters: [req.user._id]
    });

    // Link company to recruiter
    recruiter.company = company._id;
    await recruiter.save();

    res.status(201).json({
      message: 'Company created successfully',
      company,
      activeJobsCount: 0,
      recruiterCount: 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details by ID
// @route   GET /api/companies/:id
// @access  Public
export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('recruiters', 'recruiterName email title profilePicture');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const activeJobsCount = await Job.countDocuments({ company: company._id, status: 'Open' });
    const recruiterCount = company.recruiters.length;

    res.json({
      company,
      activeJobsCount,
      recruiterCount
    });
  } catch (error) {
    // Cast error for invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid company ID format' });
    }
    next(error);
  }
};

// @desc    Update company details
// @route   PUT /api/companies/:id
// @access  Private (Recruiter of that company only)
export const updateCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify updating recruiter belongs to this company
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company || recruiter.company.toString() !== req.params.id) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permissions to manage this company'
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const {
      companyName,
      logo,
      banner,
      description,
      industry,
      headquarters,
      website,
      foundedYear,
      companySize,
      contactEmail,
      socialLinks
    } = req.body;

    if (companyName) company.companyName = companyName;
    if (logo !== undefined) company.logo = logo;
    if (banner !== undefined) company.banner = banner;
    if (description !== undefined) company.description = description;
    if (industry !== undefined) company.industry = industry;
    if (headquarters !== undefined) company.headquarters = headquarters;
    if (website !== undefined) company.website = website;
    if (foundedYear !== undefined) company.foundedYear = foundedYear;
    if (companySize !== undefined) company.companySize = companySize;
    if (contactEmail !== undefined) company.contactEmail = contactEmail;
    
    if (socialLinks !== undefined) {
      company.socialLinks = {
        linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : company.socialLinks.linkedin,
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : company.socialLinks.twitter,
        facebook: socialLinks.facebook !== undefined ? socialLinks.facebook : company.socialLinks.facebook
      };
    }

    await company.save();

    const activeJobsCount = await Job.countDocuments({ company: company._id, status: 'Open' });
    const recruiterCount = company.recruiters.length;

    res.json({
      message: 'Company updated successfully',
      company,
      activeJobsCount,
      recruiterCount
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid company ID format' });
    }
    next(error);
  }
};

// @desc    List all companies
// @route   GET /api/companies
// @access  Public
export const listCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find();

    const result = await Promise.all(
      companies.map(async (company) => {
        const activeJobsCount = await Job.countDocuments({ company: company._id, status: 'Open' });
        return {
          company,
          activeJobsCount,
          recruiterCount: company.recruiters.length
        };
      })
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs of a company
// @route   GET /api/companies/:id/jobs
// @access  Public
export const getCompanyJobs = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Only return Open jobs to the public
    const jobs = await Job.find({ company: company._id, status: 'Open' })
      .populate('company', 'companyName logo')
      .populate('recruiter', 'recruiterName email title profilePicture');

    res.json(jobs);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid company ID format' });
    }
    next(error);
  }
};
