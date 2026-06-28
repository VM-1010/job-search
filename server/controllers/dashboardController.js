import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import User from '../models/userModel.js';

export const getRecruiterDashboard = async (req, res, next) => {
  try {
    const [activeJobs, closedJobs, totalJobs, totalApplications] = await Promise.all([
      Job.countDocuments({ recruiter: req.user._id, status: 'Open' }),
      Job.countDocuments({ recruiter: req.user._id, status: 'Closed' }),
      Job.countDocuments({ recruiter: req.user._id }),
      Application.countDocuments({ recruiter: req.user._id })
    ]);

    const recentApplications = await Application.find({ recruiter: req.user._id })
      .populate('applicant', 'name email')
      .populate('job', 'title location category employmentType experienceLevel salaryRange status')
      .populate('company', 'companyName logo industry headquarters')
      .sort({ createdAt: -1 })
      .limit(5);

    const applicantCountsPerJob = await Application.aggregate([
      { $match: { recruiter: req.user._id } },
      { $group: { _id: '$job', applicantCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          _id: 0,
          jobId: '$job._id',
          title: '$job.title',
          status: '$job.status',
          applicantCount: 1
        }
      },
      { $sort: { applicantCount: -1, title: 1 } }
    ]);

    res.json({
      activeJobs,
      closedJobs,
      totalJobs,
      totalApplications,
      recentApplications,
      applicantCountsPerJob
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs.job', 'title location category employmentType experienceLevel salaryRange status company recruiter createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title location category employmentType experienceLevel salaryRange status company recruiter createdAt')
      .populate('company', 'companyName logo industry headquarters')
      .sort({ createdAt: -1 });

    const recentApplications = applications.slice(0, 5);
    const totalApplications = applications.length;

    const applicationsByStatus = applications.reduce((accumulator, application) => {
      accumulator[application.status] = (accumulator[application.status] || 0) + 1;
      return accumulator;
    }, {});

    const profileFields = [
      user.name,
      user.email,
      user.profile.headline,
      user.profile.about,
      user.profile.location,
      user.profile.profilePicture || user.profile.profilePhoto,
      user.profile.resume,
      user.profile.education.length > 0,
      user.profile.experience.length > 0,
      user.profile.certifications.length > 0,
      user.profile.projects.length > 0,
      user.profile.skills.length > 0,
      user.profile.languages.length > 0,
      user.profile.socialLinks.github || user.profile.socialLinks.linkedin || user.profile.socialLinks.twitter || user.profile.socialLinks.website,
      user.profile.preferences.jobTypes.length > 0 || user.profile.preferences.locations.length > 0 || user.profile.preferences.industries.length > 0
    ];

    const profileCompletionPercentage = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    res.json({
      recentApplications,
      savedJobs: user.savedJobs,
      totalApplications,
      applicationsByStatus,
      profileCompletionPercentage
    });
  } catch (error) {
    next(error);
  }
};