import jwt from 'jsonwebtoken';

export const getAuthToken = (user, accountType) => {
  return jwt.sign(
    { id: user._id, accountType },
    process.env.JWT_SECRET || 'test_jwt_secret_key_987654321',
    { expiresIn: '30d' }
  );
};

export const getAuthHeaders = (user, accountType) => {
  const token = getAuthToken(user, accountType);
  return {
    Authorization: `Bearer ${token}`
  };
};

export const getCookieHeader = (user, accountType) => {
  const token = getAuthToken(user, accountType);
  return `token=${token}`;
};
