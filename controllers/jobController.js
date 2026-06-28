import { validationResult } from 'express-validator';
import Job from '../models/jobModel.js';
import Recruiter from '../models/recruiterModel.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
export const createJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res.status(400).json({
        message: 'Recruiter must be associated with a company to list a job. Please register or create a company profile first.'
      });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      skills,
      salaryRange,
      employmentType,
      experienceLevel,
      location,
      category
    } = req.body;

    const job = await Job.create({
      title,
      description,
      requirements,
      responsibilities,
      skills: skills || [],
      salaryRange: salaryRange || '',
      employmentType,
      experienceLevel,
      location,
      category,
      company: recruiter.company,
      recruiter: recruiter._id,
      status: 'Open'
    });

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only, belonging to same company)
export const editJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res.status(400).json({ message: 'Recruiter is not associated with any company' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify job belongs to recruiter's company
    if (job.company.toString() !== recruiter.company.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permissions to modify jobs belonging to other companies'
      });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      skills,
      salaryRange,
      employmentType,
      experienceLevel,
      location,
      category
    } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (responsibilities) job.responsibilities = responsibilities;
    if (skills) job.skills = skills;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;
    if (employmentType) job.employmentType = employmentType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (location) job.location = location;
    if (category) job.category = category;

    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only, belonging to same company)
export const deleteJob = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res.status(400).json({ message: 'Recruiter is not associated with any company' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify job belongs to recruiter's company
    if (job.company.toString() !== recruiter.company.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permissions to delete jobs belonging to other companies'
      });
    }

    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }
    next(error);
  }
};

// @desc    Close a job listing
// @route   PUT /api/jobs/:id/close
// @access  Private (Recruiter only, belonging to same company)
export const closeJob = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res.status(400).json({ message: 'Recruiter is not associated with any company' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify job belongs to recruiter's company
    if (job.company.toString() !== recruiter.company.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permissions to close jobs belonging to other companies'
      });
    }

    job.status = 'Closed';
    await job.save();

    res.json({
      message: 'Job status updated to Closed successfully',
      job
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }
    next(error);
  }
};

// @desc    Reopen a job listing
// @route   PUT /api/jobs/:id/reopen
// @access  Private (Recruiter only, belonging to same company)
export const reopenJob = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res.status(400).json({ message: 'Recruiter is not associated with any company' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify job belongs to recruiter's company
    if (job.company.toString() !== recruiter.company.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permissions to reopen jobs belonging to other companies'
      });
    }

    job.status = 'Open';
    await job.save();

    res.json({
      message: 'Job status updated to Open successfully',
      job
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }
    next(error);
  }
};

// @desc    Get jobs created by currently logged in recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter only)
export const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .populate('company', 'companyName logo')
      .populate('recruiter', 'recruiterName email title');
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (Search, filter, view open listings)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const query = { status: 'Open' }; // default only show Open listings

    // Search query param (searches title, description, or skills)
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { skills: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Title filter (specific text)
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
    }

    // Category filter
    if (req.query.category) {
      query.category = { $regex: req.query.category, $options: 'i' };
    }

    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // Employment type filter
    if (req.query.employmentType) {
      query.employmentType = req.query.employmentType;
    }

    // Company filter
    if (req.query.companyId) {
      query.company = req.query.companyId;
    }

    const jobs = await Job.find(query)
      .populate('company', 'companyName logo industry headquarters website')
      .populate('recruiter', 'recruiterName email title profilePicture')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName logo industry headquarters website companySize description contactEmail foundedYear socialLinks')
      .populate('recruiter', 'recruiterName email title profilePicture');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }
    next(error);
  }
};
