import React from 'react';
import { useParams } from 'react-router-dom';
import { Building } from 'lucide-react';

const CompanyDetails = () => {
  const { id } = useParams();

  return (
    <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-6 shadow-lg shadow-purple-500/5">
        <Building className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Company Profile</h1>
      <p className="text-xs font-mono text-slate-500 mt-2 bg-slate-900 border border-slate-800 rounded px-2 py-1">
        Company ID: {id}
      </p>
      <p className="mt-4 max-w-md text-slate-400">
        Review company history, active job postings, employee insights, and recruiters list in Phase 2.
      </p>
    </div>
  );
};

export default CompanyDetails;
