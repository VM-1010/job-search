import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Professional Profile</h1>
            <p className="text-sm text-slate-400">Manage your resume, projects, experience, and educational background</p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="rounded-xl border border-slate-850 bg-slate-950 p-6 text-center max-w-lg mx-auto my-12">
            <h2 className="text-lg font-bold text-white mb-2">Profile Editor (Phase 2)</h2>
            <p className="text-sm text-slate-400">
              The profile details forms, certifications lists, and resume file upload system will be active in the next phase of development.
            </p>
            <div className="mt-6 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-400">
              <span>Account Holder: {user?.name}</span>
              <span>Email: {user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
