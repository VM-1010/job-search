import CompanyProfile from '../models/CompanyProfile.js';

// GET /api/emp/profile
// Returns the authenticated employer's company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ employer: req.dbEmployer._id });

    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('getCompanyProfile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/emp/profile
// Creates or updates the authenticated employer's company profile (upsert)
export const upsertCompanyProfile = async (req, res) => {
  try {
    const { companyName, logo, description, category } = req.body;

    const profile = await CompanyProfile.findOneAndUpdate(
      { employer: req.dbEmployer._id },
      { companyName, logo, description, category },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error('upsertCompanyProfile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
