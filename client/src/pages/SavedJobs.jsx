import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Bookmark,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowRight,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';

const SavedJobs = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch saved jobs
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const response = await api.get('/users/saved-jobs');
      return response.data;
    }
  });

  const savedJobs = data?.savedJobs || [];

  // Remove saved job mutation
  const unsaveMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await api.delete(`/users/saved-jobs/${jobId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user'] });
      addToast('Job removed from bookmarks', 'success');
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to remove job', 'error');
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading your saved jobs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Failed to Load Saved Jobs</h1>
        <p className="mt-4 max-w-md text-slate-400">
          {error?.response?.data?.message || error?.message || 'Could not retrieve your bookmarked positions.'}
        </p>
      </div>
    );
  }

  const getCompanyInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'CO';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Saved Jobs</h1>
            <p className="text-sm text-slate-400 mt-0.5">Bookmarked positions you are tracking or plan to apply to</p>
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <div className="rounded-xl border border-slate-850 bg-slate-950 p-12 text-center max-w-md mx-auto my-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 mx-auto text-slate-500 mb-5">
              <Bookmark className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Your bookmarks list is empty</h2>
            <p className="text-sm text-slate-400 mb-6">
              When browsing, click the "Save Job" button on a job post to save it here for later.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Search Open Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((item) => {
              const job = item.job || {};
              const company = job.company || {};
              const isClosed = job.status === 'Closed';

              return (
                <div
                  key={item._id}
                  className={`group relative rounded-2xl border transition-all duration-300 backdrop-blur-sm p-6 flex flex-col justify-between ${
                    isClosed
                      ? 'border-slate-900 bg-slate-950/40 opacity-70'
                      : 'border-slate-805 bg-slate-950/20 hover:bg-slate-900/40 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {/* Company Logo/Placeholder */}
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.companyName}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-805 bg-slate-900"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-xs">
                            {getCompanyInitials(company.companyName)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-base">
                            <Link to={`/job/${job._id}`}>{job.title}</Link>
                          </h3>
                          {company.companyName && (
                            <p className="text-xs text-slate-350 mt-0.5 font-medium">{company.companyName}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {isClosed ? (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                            Closed
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta tags */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-550" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-slate-550" />
                        <span className="truncate">{job.employmentType} • {job.experienceLevel}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-slate-550" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-550" />
                        <span>Saved {new Date(item.savedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-slate-850 mt-6 pt-4 gap-4">
                    <button
                      onClick={() => unsaveMutation.mutate(job._id)}
                      disabled={unsaveMutation.isPending}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-450 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl px-3 py-2 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Bookmark
                    </button>

                    <Link
                      to={`/job/${job._id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-indigo-650 hover:text-white hover:border-transparent transition-all group/btn"
                    >
                      <ArrowRight className="h-4.5 w-4.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
