import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const loggedInUser = data.seeker || data.recruiter;
    setUser(loggedInUser);
    return data;
  };

  const registerSeeker = async (data) => {
    const result = await authService.registerSeeker(data);
    const registeredUser = result.seeker || result.user;
    setUser(registeredUser);
    return result;
  };

  const registerRecruiter = async (data) => {
    const result = await authService.registerRecruiter(data);
    setUser(result.recruiter);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
  };

  const value = {
    user,
    loading,
    login,
    registerSeeker,
    registerRecruiter,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isSeeker: user?.accountType === 'seeker',
    isRecruiter: user?.accountType === 'recruiter',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
