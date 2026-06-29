import React from 'react';
import { Briefcase } from 'lucide-react';

const RecruiterJobs = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Job Postings</h1>
            <p className="text-sm text-slate-400">Create, edit, close, and monitor your company's active roles</p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="rounded-xl border border-slate-850 bg-slate-950 p-6 text-center max-w-lg mx-auto my-12">
            <h2 className="text-lg font-bold text-white mb-2">Job Listings Management (Phase 2)</h2>
            <p className="text-sm text-slate-400">
              The ability to post new jobs, configure requirements/responsibilities, and close/reopen postings will be active in Phase 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterJobs;
