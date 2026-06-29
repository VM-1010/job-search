import React from 'react';
import { Bookmark } from 'lucide-react';

const SavedJobs = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
            <p className="text-sm text-slate-400">Bookmarked positions you are tracking or plan to apply to</p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="rounded-xl border border-slate-850 bg-slate-950 p-6 text-center max-w-lg mx-auto my-12">
            <h2 className="text-lg font-bold text-white mb-2">Saved Positions (Phase 2)</h2>
            <p className="text-sm text-slate-400">
              The ability to bookmark job listings and view them in a consolidated dashboard is part of the Phase 2 implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;
