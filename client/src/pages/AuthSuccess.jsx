import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const { checkAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Trigger checkAuth to load user profile via cookie
        await checkAuth();
      } catch (err) {
        console.error('Failed to load user profile after Google login', err);
        navigate('/login', { replace: true });
      }
    };

    handleSuccess();
  }, [checkAuth, navigate]);

  // Once authenticated, redirect to seeker dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-semibold">Completing login with Google...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
