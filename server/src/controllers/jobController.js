import Job from '../models/Job.js';
import Application from '../models/Application.js';

// GET /api/jobs
// Returns all jobs with optional filters and applicant count per job
export const getAllJobs = async (req, res) => {
  try {
    const { company, search, location, salaryMin, salaryMax } = req.query;

    const filter = {};

    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (salaryMin) {
      filter.salaryMax = { $gte: Number(salaryMin) };
    }

    if (salaryMax) {
      filter.salaryMin = { ...filter.salaryMin, $lte: Number(salaryMax) };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Count applicants for each job
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount };
      })
    );

    res.status(200).json(jobsWithCount);
  } catch (error) {
    console.error('getAllJobs error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/jobs/:id
// Returns a single job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicantCount = await Application.countDocuments({ job: job._id });

    res.status(200).json({ ...job.toObject(), applicantCount });
  } catch (error) {
    console.error('getJobById error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/emp/jobs
// Returns all jobs posted by the authenticated employer
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.dbEmployer._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('getEmployerJobs error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/emp/jobs/:id
// Returns a single employer job (must belong to the employer)
export const getEmployerJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.dbEmployer._id });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('getEmployerJobById error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/emp/jobs
// Creates a new job listing
export const createJob = async (req, res) => {
  try {
    const { title, company, description, additionalInfo, salaryMin, salaryMax, location, category } =
      req.body;

    if (!title || !company || !description || !location) {
      return res.status(400).json({ message: 'title, company, description and location are required' });
    }

    const job = await Job.create({
      employer: req.dbEmployer._id,
      title,
      company,
      description,
      additionalInfo,
      salaryMin,
      salaryMax,
      location,
      category,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('createJob error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/emp/jobs/:id
// Updates an existing job listing
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: req.dbEmployer._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('updateJob error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/emp/jobs/:id
// Deletes a job listing and all its applications
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: req.dbEmployer._id,
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Also remove all applications for this job
    await Application.deleteMany({ job: job._id });

    res.status(200).json({ message: 'Job deleted' });
  } catch (error) {
    console.error('deleteJob error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
