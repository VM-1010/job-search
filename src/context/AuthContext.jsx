import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
      // Clear token cookie from client perspective if any issues
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const registerSeeker = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/seeker', { name, email, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const registerRecruiter = async (userData) => {
    setLoading(true);
    try {
      // userData includes recruiterName, email, password, title, profilePicture, company
      const response = await api.post('/auth/register/recruiter', userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    accountType: user?.accountType || null,
    login,
    registerSeeker,
    registerRecruiter,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
