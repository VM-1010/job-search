import { validationResult } from 'express-validator';
import Company from '../models/companyModel.js';
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
    const query = { status: 'Open' };
    const orFilters = [];

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      orFilters.push(
        { title: searchRegex },
        { description: searchRegex },
        { skills: searchRegex },
        { category: searchRegex },
        { location: searchRegex },
        { employmentType: searchRegex }
      );

      const matchingCompanies = await Company.find({
        $or: [
          { companyName: searchRegex },
          { industry: searchRegex }
        ]
      }).select('_id');

      if (matchingCompanies.length > 0) {
        orFilters.push({ company: { $in: matchingCompanies.map((company) => company._id) } });
      }
    }

    if (req.query.title) {
      orFilters.push({ title: { $regex: req.query.title, $options: 'i' } });
    }

    if (req.query.category) {
      query.category = { $regex: req.query.category, $options: 'i' };
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.employmentType) {
      query.employmentType = req.query.employmentType;
    }

    if (req.query.companyId) {
      query.company = req.query.companyId;
    }

    if (req.query.company) {
      if (req.query.company.match(/^[0-9a-fA-F]{24}$/)) {
        query.company = req.query.company;
      } else {
        const matchingCompanies = await Company.find({
          companyName: { $regex: req.query.company, $options: 'i' }
        }).select('_id');

        if (matchingCompanies.length > 0) {
          orFilters.push({ company: { $in: matchingCompanies.map((company) => company._id) } });
        }
      }
    }

    if (orFilters.length > 0) {
      query.$or = orFilters;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
      .populate('company', 'companyName logo industry headquarters website')
      .populate('recruiter', 'recruiterName email title profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
