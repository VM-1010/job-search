import jwt from 'jsonwebtoken';

const generateToken = (res, userId, accountType) => {
  const token = jwt.sign(
    { id: userId, accountType },
    process.env.JWT_SECRET || 'fallback_secret_key_123',
    { expiresIn: '30d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
};

export default generateToken;
