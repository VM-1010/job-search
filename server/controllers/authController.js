import { validationResult } from 'express-validator';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new Job Seeker
// @route   POST /api/auth/register/seeker
// @access  Public
export const registerSeeker = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check email uniqueness across both Seeker and Recruiter schemas
    const seekerExists = await User.findOne({ email: email.toLowerCase() });
    const recruiterExists = await Recruiter.findOne({ email: email.toLowerCase() });

    if (seekerExists || recruiterExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    const token = generateToken(res, user._id, 'seeker');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: 'seeker',
      profile: user.profile,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Recruiter
// @route   POST /api/auth/register/recruiter
// @access  Public
export const registerRecruiter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recruiterName, email, password, title, profilePicture, company } = req.body;

    // Check email uniqueness across both Seeker and Recruiter schemas
    const seekerExists = await User.findOne({ email: email.toLowerCase() });
    const recruiterExists = await Recruiter.findOne({ email: email.toLowerCase() });

    if (seekerExists || recruiterExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const recruiter = await Recruiter.create({
      recruiterName,
      email: email.toLowerCase(),
      password,
      title: title || '',
      profilePicture: profilePicture || '',
      company: company || null
    });

    const token = generateToken(res, recruiter._id, 'recruiter');

    res.status(201).json({
      _id: recruiter._id,
      recruiterName: recruiter.recruiterName,
      email: recruiter.email,
      accountType: 'recruiter',
      title: recruiter.title,
      profilePicture: recruiter.profilePicture,
      company: recruiter.company,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate User & Recruiter, get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Search in Seeker collection first
    let user = await User.findOne({ email: email.toLowerCase() });
    let accountType = 'seeker';

    // If not found in seekers, search in recruiters
    if (!user) {
      user = await Recruiter.findOne({ email: email.toLowerCase() });
      accountType = 'recruiter';
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Google-only authenticated job seekers don't have passwords set
    if (!user.password) {
      return res.status(400).json({
        message: 'This email is linked with Google OAuth. Please login with Google.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(res, user._id, accountType);

    if (accountType === 'seeker') {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        accountType,
        profile: user.profile,
        token
      });
    } else {
      res.json({
        _id: user._id,
        recruiterName: user.recruiterName,
        email: user.email,
        accountType,
        title: user.title,
        profilePicture: user.profilePicture,
        company: user.company,
        token
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Successfully logged out' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (req.accountType === 'seeker') {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        accountType: 'seeker',
        profile: user.profile
      });
    } else if (req.accountType === 'recruiter') {
      const recruiter = await Recruiter.findById(req.user._id).select('-password');
      if (!recruiter) {
        return res.status(404).json({ message: 'Recruiter not found' });
      }
      res.json({
        _id: recruiter._id,
        recruiterName: recruiter.recruiterName,
        email: recruiter.email,
        accountType: 'recruiter',
        title: recruiter.title,
        profilePicture: recruiter.profilePicture,
        company: recruiter.company
      });
    } else {
      res.status(400).json({ message: 'Invalid account type' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update Job Seeker profile
// @route   PUT /api/auth/profile
// @access  Private (Seeker only)
export const updateProfile = async (req, res, next) => {
  try {
    if (req.accountType !== 'seeker') {
      return res.status(403).json({ message: 'Only job seekers can edit their profile' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      headline,
      about,
      location,
      profilePhoto,
      profilePicture,
      education,
      experience,
      certifications,
      projects,
      skills,
      languages,
      socialLinks,
      resume,
      preferences
    } = req.body;

    if (headline !== undefined) user.profile.headline = headline;
    if (about !== undefined) user.profile.about = about;
    if (location !== undefined) user.profile.location = location;
    if (profilePhoto !== undefined) {
      user.profile.profilePhoto = profilePhoto;
      user.profile.profilePicture = profilePhoto;
    }
    if (profilePicture !== undefined) {
      user.profile.profilePicture = profilePicture;
      user.profile.profilePhoto = profilePicture;
    }
    if (education !== undefined) user.profile.education = education;
    if (experience !== undefined) user.profile.experience = experience;
    if (certifications !== undefined) user.profile.certifications = certifications;
    if (projects !== undefined) user.profile.projects = projects;
    if (skills !== undefined) user.profile.skills = skills;
    if (languages !== undefined) user.profile.languages = languages;
    
    if (socialLinks !== undefined) {
      user.profile.socialLinks = {
        github: socialLinks.github !== undefined ? socialLinks.github : user.profile.socialLinks.github,
        linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : user.profile.socialLinks.linkedin,
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : user.profile.socialLinks.twitter,
        website: socialLinks.website !== undefined ? socialLinks.website : user.profile.socialLinks.website
      };
    }
    
    if (resume !== undefined) user.profile.resume = resume;
    
    if (preferences !== undefined) {
      user.profile.preferences = {
        jobTypes: preferences.jobTypes !== undefined ? preferences.jobTypes : user.profile.preferences.jobTypes,
        locations: preferences.locations !== undefined ? preferences.locations : user.profile.preferences.locations,
        industries: preferences.industries !== undefined ? preferences.industries : user.profile.preferences.industries
      };
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: 'seeker',
      profile: user.profile
    });
  } catch (error) {
    next(error);
  }
};
