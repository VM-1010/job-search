import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';

const RecruiterLayout = () => {
  return (
    <ProtectedRoute allowedRoles={['recruiter']}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default RecruiterLayout;
