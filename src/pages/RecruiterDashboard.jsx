import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ShieldCheck, Briefcase } from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recruiter Dashboard</h1>
            <p className="text-sm text-slate-400">Manage jobs, review candidates, and manage your company profile</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Welcome banner */}
            <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Welcome, {user?.recruiterName || 'Recruiter'}!
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                </h2>
                <p className="mt-2 text-sm text-slate-350">
                  Your Recruiter account has been successfully initialized. You can now configure your company workspace and manage developer recruits.
                </p>
              </div>
              <div className="mt-6 border-t border-purple-500/10 pt-4 flex flex-col sm:flex-row justify-between text-xs text-purple-400 gap-2">
                <span>Recruiter ID: {user?._id}</span>
                <span>Job Title: {user?.title || 'Not Set'}</span>
              </div>
            </div>

            {/* Mock stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-850 bg-slate-950 p-5 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">Active Listings</p>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-950 p-5 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">Total Applicants</p>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-950 p-5 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">Recruiters List</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-850 bg-slate-950 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Employer Profile</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="block text-xs text-slate-400">Email Address</span>
                  <span className="text-white font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Associated Company</span>
                  <span className="text-white font-medium">
                    {user?.company ? 'Linked' : 'Not Associated (Create company in Phase 2)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
