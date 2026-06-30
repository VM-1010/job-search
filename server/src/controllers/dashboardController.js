import Application from '../models/Application.js';

// GET /api/dashboard
// Returns application counts for the authenticated user
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.dbUser._id;

    const applications = await Application.find({ user: userId });

    const stats = {
      applied: applications.length,
      pending: applications.filter((a) => a.status === 'Pending').length,
      interview: applications.filter((a) => a.status === 'Interview').length,
      accepted: applications.filter((a) => a.status === 'Accepted').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('getUserDashboard error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/emp/dashboard
// Returns job and application counts for the authenticated employer
export const getEmployerDashboard = async (req, res) => {
  try {
    const employerId = req.dbEmployer._id;

    const applications = await Application.find({ employer: employerId })
      .populate('job', 'title company')
      .populate('user', 'clerkId')
      .sort({ createdAt: -1 });

    const stats = {
      jobsPosted: await import('../models/Job.js').then((m) =>
        m.default.countDocuments({ employer: employerId })
      ),
      total: applications.length,
      pending: applications.filter((a) => a.status === 'Pending').length,
      interview: applications.filter((a) => a.status === 'Interview').length,
      accepted: applications.filter((a) => a.status === 'Accepted').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
      recentApplications: applications.slice(0, 10),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('getEmployerDashboard error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
