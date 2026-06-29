import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import SeekerLayout from '../layouts/SeekerLayout';
import RecruiterLayout from '../layouts/RecruiterLayout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import RegisterSeeker from '../pages/RegisterSeeker';
import RegisterRecruiter from '../pages/RegisterRecruiter';
import Jobs from '../pages/Jobs';
import Companies from '../pages/Companies';
import JobDetails from '../pages/JobDetails';
import CompanyDetails from '../pages/CompanyDetails';
import AuthSuccess from '../pages/AuthSuccess';

// Seeker Pages
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import SavedJobs from '../pages/SavedJobs';
import Applications from '../pages/Applications';

// Recruiter Pages
import RecruiterDashboard from '../pages/RecruiterDashboard';
import RecruiterJobs from '../pages/RecruiterJobs';
import RecruiterCompany from '../pages/RecruiterCompany';

// 404 Page
import { AlertTriangle } from 'lucide-react';
const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
      <AlertTriangle className="h-8 w-8" />
    </div>
    <h1 className="text-3xl font-extrabold sm:text-4xl">404 - Page Not Found</h1>
    <p className="mt-4 max-w-md text-slate-400">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <a
      href="/"
      className="mt-8 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold shadow hover:bg-indigo-500 transition-colors"
    >
      Return Home
    </a>
  </div>
);

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'register/seeker', element: <RegisterSeeker /> },
      { path: 'register/recruiter', element: <RegisterRecruiter /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'companies', element: <Companies /> },
      { path: 'job/:id', element: <JobDetails /> },
      { path: 'company/:id', element: <CompanyDetails /> },
      { path: 'auth-success', element: <AuthSuccess /> },
    ],
  },
  
  // Protected Seeker Routes
  {
    path: '/',
    element: <SeekerLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'saved-jobs', element: <SavedJobs /> },
      { path: 'applications', element: <Applications /> },
    ],
  },

  // Protected Recruiter Routes
  {
    path: '/recruiter',
    element: <RecruiterLayout />,
    children: [
      { path: 'dashboard', element: <RecruiterDashboard /> },
      { path: 'jobs', element: <RecruiterJobs /> },
      { path: 'company', element: <RecruiterCompany /> },
    ],
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFound />,
  },
]);
