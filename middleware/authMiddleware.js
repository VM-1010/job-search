import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';

// Protect routes - Verify JWT and set user context
export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from cookies or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');

    // Attach user/recruiter based on accountType in payload
    if (decoded.accountType === 'seeker') {
      req.user = await User.findById(decoded.id).select('-password');
      req.accountType = 'seeker';
    } else if (decoded.accountType === 'recruiter') {
      req.user = await Recruiter.findById(decoded.id).select('-password');
      req.accountType = 'recruiter';
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

// Authorize based on account types/roles
export const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user || !req.accountType) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!allowedTypes.includes(req.accountType)) {
      return res.status(403).json({
        message: `Forbidden: Account type '${req.accountType}' is not authorized to access this resource`
      });
    }

    next();
  };
};
