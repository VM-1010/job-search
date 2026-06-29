import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seeker Dashboard</h1>
            <p className="text-sm text-slate-400">Manage your profile, applications, and settings</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Welcome banner */}
            <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Welcome, {user?.name || 'Job Seeker'}!
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </h2>
                <p className="mt-2 text-sm text-slate-350">
                  Your Job Seeker account has been successfully initialized. You can now build your profile, save listings, and prepare for applications.
                </p>
              </div>
              <div className="mt-6 border-t border-indigo-500/10 pt-4 flex flex-col sm:flex-row justify-between text-xs text-indigo-400 gap-2">
                <span>Account ID: {user?._id}</span>
                <span>Type: {user?.accountType}</span>
              </div>
            </div>

            {/* Mock stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-850 bg-slate-950 p-5 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">Applications Sent</p>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-950 p-5 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">Saved Jobs</p>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-950 p-5 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">Notifications</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-850 bg-slate-950 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Account Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="block text-xs text-slate-400">Email Address</span>
                  <span className="text-white font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Member Since</span>
                  <span className="text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
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

export default Dashboard;
