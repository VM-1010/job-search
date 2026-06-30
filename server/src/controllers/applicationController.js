import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Profile from '../models/Profile.js';

// GET /api/applications
// Returns all applications for the authenticated user
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.dbUser._id })
      .populate('job', 'title company location')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('getMyApplications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/applications
// Creates a new application — prevents duplicates
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({ user: req.dbUser._id, job: jobId });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      user: req.dbUser._id,
      employer: job.employer,
      job: jobId,
      status: 'Pending',
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('applyToJob error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/applications/:id
// Removes an application that belongs to the authenticated user
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.dbUser._id,
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application removed' });
  } catch (error) {
    console.error('deleteApplication error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/emp/jobs/:id/applications
// Returns all applications for a specific job owned by the employer
export const getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Ensure the job belongs to this employer
    const job = await Job.findOne({ _id: jobId, employer: req.dbEmployer._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('user', 'clerkId')
      .sort({ appliedAt: -1 });

    // Attach profile name for each applicant
    const result = await Promise.all(
      applications.map(async (app) => {
        const profile = await Profile.findOne({ user: app.user._id }).select('name');
        return {
          ...app.toObject(),
          applicantName: profile?.name || 'Unknown',
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('getJobApplications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/emp/applications/:id
// Employer updates the status of an application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Interview', 'Accepted', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Only update if the application belongs to a job owned by this employer
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, employer: req.dbEmployer._id },
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('updateApplicationStatus error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
