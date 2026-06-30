import Profile from '../models/Profile.js';

// GET /api/profile
// Returns the authenticated user's profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.dbUser._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('getProfile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/profile
// Creates or updates the authenticated user's profile (upsert)
export const upsertProfile = async (req, res) => {
  try {
    const { name, place, contact, about, education, experience, training, competitions } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.dbUser._id },
      { name, place, contact, about, education, experience, training, competitions },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error('upsertProfile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/emp/profile/:userId
// Employer views an applicant's profile by User MongoDB ID
export const getApplicantProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('getApplicantProfile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
