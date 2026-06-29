import React from 'react';
import { Building } from 'lucide-react';

const Companies = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-6 shadow-lg shadow-purple-500/5">
        <Building className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Browse Companies</h1>
      <p className="mt-4 max-w-md text-slate-400">
        The Company Directory is part of Phase 2. Soon, recruiters will manage company profiles and seekers will explore workspaces and benefits.
      </p>
      <div className="mt-8">
        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-sm font-medium text-slate-350">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold">Phase 1 (Done)</span>
          <span className="px-3 py-1.5 text-slate-500">Phase 2 (Company Spaces)</span>
        </div>
      </div>
    </div>
  );
};

export default Companies;
