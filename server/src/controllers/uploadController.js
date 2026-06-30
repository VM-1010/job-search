import Profile from '../models/Profile.js';

// POST /api/upload/resume
// Accepts a single PDF file and saves its path to the user's profile
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    // Build a URL path the frontend can use to access the file
    const resumeUrl = `/uploads/${req.file.filename}`;

    // Upsert the profile with the new resume URL
    const profile = await Profile.findOneAndUpdate(
      { user: req.dbUser._id },
      { resumeUrl },
      { new: true, upsert: true }
    );

    res.status(200).json({ resumeUrl, profile });
  } catch (error) {
    console.error('uploadResume error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
