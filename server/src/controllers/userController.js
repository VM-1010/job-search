import User from '../models/User.js';
import Employer from '../models/Employer.js';
import { getAuth } from '@clerk/express';

// POST /api/auth/sync
// Called by the frontend after Clerk login to ensure a MongoDB document exists.
// The role query param determines whether to create a User or Employer.
export const syncUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role } = req.body; // 'user' or 'employer'

    if (role === 'employer') {
      let employer = await Employer.findOne({ clerkId: userId });
      if (!employer) {
        employer = await Employer.create({ clerkId: userId });
      }
      return res.status(200).json({ role: 'employer', id: employer._id });
    } else {
      let user = await User.findOne({ clerkId: userId });
      if (!user) {
        user = await User.create({ clerkId: userId });
      }
      return res.status(200).json({ role: 'user', id: user._id });
    }
  } catch (error) {
    console.error('syncUser error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
