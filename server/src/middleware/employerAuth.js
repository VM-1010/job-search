import { getAuth } from '@clerk/express';
import Employer from '../models/Employer.js';

// Verify Clerk token and attach the MongoDB Employer document to req.dbEmployer
export const requireEmployer = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No Clerk session' });
    }

    // Find or create the Employer document in MongoDB
    let employer = await Employer.findOne({ clerkId: userId });
    if (!employer) {
      employer = await Employer.create({ clerkId: userId });
    }

    req.clerkId = userId;
    req.dbEmployer = employer;
    next();
  } catch (error) {
    console.error('Employer auth middleware error:', error.message);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
