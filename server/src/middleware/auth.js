import { clerkMiddleware, getAuth } from '@clerk/express';
import User from '../models/User.js';

// Verify Clerk token and attach the MongoDB User document to req.dbUser
export const requireUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No Clerk session' });
    }

    // Find or create the User document in MongoDB
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = await User.create({ clerkId: userId });
    }

    req.clerkId = userId;
    req.dbUser = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
