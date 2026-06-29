import { validationResult } from 'express-validator';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import User from '../models/userModel.js';

const ensureSeeker = (req, res) => {
  if (req.accountType !== 'seeker') {
    res.status(403).json({ message: 'Only job seekers can access this resource' });
    return false;
  }

  return true;
};

const getProfileOr404 = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'savedJobs.job',
    select: 'title location category employmentType experienceLevel salaryRange status company recruiter createdAt',
    populate: {
      path: 'company',
      select: 'companyName logo'
    }
  });
  return user;
};

const updateNestedProfileObject = (user, key, incoming) => {
  user.profile[key] = {
    ...user.profile[key].toObject?.() ?? user.profile[key],
    ...incoming
  };
};

const updateSubdocument = (items, itemId, updates) => {
  const item = items.id(itemId);
  if (!item) {
    return null;
  }

  Object.assign(item, updates);
  return item;
};

const deleteSubdocument = (items, itemId) => {
  const item = items.id(itemId);
  if (!item) {
    return false;
  }

  item.deleteOne();
  return true;
};

const getBaseProfileResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  accountType: 'seeker',
  profile: user.profile,
  savedJobs: user.savedJobs
});

const getProfileCompletionPercentage = (user) => {
  const checks = [
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

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

export const getProfile = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await getProfileOr404(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(getBaseProfileResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateHeadline = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.headline = req.body.headline;
    await user.save();

    res.json({ message: 'Headline updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const updateAbout = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.about = req.body.about;
    await user.save();

    res.json({ message: 'About section updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.location = req.body.location;
    await user.save();

    res.json({ message: 'Location updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.resume = req.body.resume;
    await user.save();

    res.json({ message: 'Resume updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.profilePicture = req.body.profilePicture;
    user.profile.profilePhoto = req.body.profilePicture;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    updateNestedProfileObject(user, 'preferences', req.body.preferences || {});
    await user.save();

    res.json({ message: 'Preferences updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const updateSocialLinks = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    updateNestedProfileObject(user, 'socialLinks', req.body.socialLinks || {});
    await user.save();

    res.json({ message: 'Social links updated successfully', profile: user.profile });
  } catch (error) {
    next(error);
  }
};

export const addEducation = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.education.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Education added successfully', education: user.profile.education.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const education = updateSubdocument(user.profile.education, req.params.id, req.body);
    if (!education) {
      return res.status(404).json({ message: 'Education entry not found' });
    }

    await user.save();
    res.json({ message: 'Education updated successfully', education });
  } catch (error) {
    next(error);
  }
};

export const deleteEducation = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleted = deleteSubdocument(user.profile.education, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Education entry not found' });
    }

    await user.save();
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addExperience = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.experience.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Experience added successfully', experience: user.profile.experience.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const experience = updateSubdocument(user.profile.experience, req.params.id, req.body);
    if (!experience) {
      return res.status(404).json({ message: 'Experience entry not found' });
    }

    await user.save();
    res.json({ message: 'Experience updated successfully', experience });
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleted = deleteSubdocument(user.profile.experience, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Experience entry not found' });
    }

    await user.save();
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addCertification = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.certifications.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Certification added successfully', certification: user.profile.certifications.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateCertification = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const certification = updateSubdocument(user.profile.certifications, req.params.id, req.body);
    if (!certification) {
      return res.status(404).json({ message: 'Certification entry not found' });
    }

    await user.save();
    res.json({ message: 'Certification updated successfully', certification });
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleted = deleteSubdocument(user.profile.certifications, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Certification entry not found' });
    }

    await user.save();
    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addProject = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.projects.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Project added successfully', project: user.profile.projects.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = updateSubdocument(user.profile.projects, req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ message: 'Project entry not found' });
    }

    await user.save();
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleted = deleteSubdocument(user.profile.projects, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Project entry not found' });
    }

    await user.save();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.skills.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Skill added successfully', skill: user.profile.skills.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skill = updateSubdocument(user.profile.skills, req.params.id, req.body);
    if (!skill) {
      return res.status(404).json({ message: 'Skill entry not found' });
    }

    await user.save();
    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleted = deleteSubdocument(user.profile.skills, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Skill entry not found' });
    }

    await user.save();
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addLanguage = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.languages.push(req.body);
    await user.save();

    res.status(201).json({ message: 'Language added successfully', language: user.profile.languages.at(-1) });
  } catch (error) {
    next(error);
  }
};

export const updateLanguage = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const language = updateSubdocument(user.profile.languages, req.params.id, req.body);
    if (!language) {
      return res.status(404).json({ message: 'Language entry not found' });
    }

    await user.save();
    res.json({ message: 'Language updated successfully', language });
  } catch (error) {
    next(error);
  }
};

export const deleteLanguage = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleted = deleteSubdocument(user.profile.languages, req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Language entry not found' });
    }

    await user.save();
    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadySaved = user.savedJobs.some((savedJob) => savedJob.job.toString() === req.params.jobId);
    if (alreadySaved) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    user.savedJobs.push({ job: job._id });
    await user.save();

    res.status(201).json({ message: 'Job saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const removeSavedJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!ensureSeeker(req, res)) return;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.savedJobs.findIndex((savedJob) => savedJob.job.toString() === req.params.jobId);
    if (index === -1) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    user.savedJobs.splice(index, 1);
    await user.save();

    res.json({ message: 'Saved job removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

    const user = await getProfileOr404(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedJobs = [...user.savedJobs].sort((left, right) => new Date(right.savedAt) - new Date(left.savedAt));

    res.json({
      savedJobs
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    if (!ensureSeeker(req, res)) return;

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

    res.json({
      recentApplications,
      savedJobs: user.savedJobs,
      totalApplications,
      applicationsByStatus,
      profileCompletionPercentage: getProfileCompletionPercentage(user)
    });
  } catch (error) {
    next(error);
  }
};