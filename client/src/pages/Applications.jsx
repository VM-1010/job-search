import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import {
  Send,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  Building
} from 'lucide-react';

const Applications = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedLetterId, setExpandedLetterId] = useState(null);

  // Fetch seeker's applications
  const { data: applications = [], isLoading, isError, error } = useQuery({
    queryKey: ['applications', 'mine'],
    queryFn: async () => {
      const response = await api.get('/applications/my-applications');
      return response.data;
    }
  });

  const statuses = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected'];

  const filteredApplications = statusFilter === 'All'
    ? applications
    : applications.filter(app => app.status === statusFilter);

  const toggleCoverLetter = (appId) => {
    if (expandedLetterId === appId) {
      setExpandedLetterId(null);
    } else {
      setExpandedLetterId(appId);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    let colorClasses = 'bg-slate-900 border-slate-800 text-slate-400';
    if (status === 'Applied') colorClasses = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    else if (status === 'Under Review') colorClasses = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    else if (status === 'Shortlisted') colorClasses = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    else if (status === 'Interview') colorClasses = 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    else if (status === 'Accepted') colorClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    else if (status === 'Rejected') colorClasses = 'bg-rose-500/10 border-rose-500/20 text-rose-400';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}>
        {status}
      </span>
    );
  };

  const getCompanyInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'CO';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading your applications...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Failed to Load Applications</h1>
        <p className="mt-4 max-w-md text-slate-400">
          {error?.response?.data?.message || error?.message || 'We could not load your applications history.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-[calc(100vh-4rem-12rem)]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-sm shadow-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-850 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">My Applications</h1>
              <p className="text-sm text-slate-400 mt-0.5">Track and review the status of your job submissions</p>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-850">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="rounded-xl border border-slate-850 bg-slate-955 p-12 text-center max-w-md mx-auto my-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 mx-auto text-slate-500 mb-5">
              <Send className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No applications found</h2>
            <p className="text-sm text-slate-400 mb-6">
              {statusFilter === 'All'
                ? "You haven't submitted any job applications yet."
                : `You don't have any applications matching the status "${statusFilter}".`}
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              Browse Open Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => {
              const job = app.job || {};
              const company = app.company || {};
              const isExpanded = expandedLetterId === app._id;

              return (
                <div
                  key={app._id}
                  className="rounded-2xl border border-slate-805 bg-slate-950/20 p-5 md:p-6 hover:border-slate-750 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5 mb-5">
                    {/* Job Details Card */}
                    <div className="flex items-center gap-4">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.companyName}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-800 bg-slate-950"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-sm">
                          {getCompanyInitials(company.companyName)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-white text-base md:text-lg hover:text-indigo-400 transition-colors">
                          <Link to={`/job/${job._id}`}>{job.title || 'Job Title'}</Link>
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-slate-300">{company.companyName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-400">{job.employmentType}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status & Date */}
                    <div className="flex items-center md:items-end justify-between md:flex-col gap-4 w-full md:w-auto">
                      <span className="text-xs text-slate-500 flex items-center gap-1 order-2 md:order-1 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        Applied on {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="order-1 md:order-2">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Collapsible cover letter */}
                  <div className="space-y-4">
                    {app.coverLetter && (
                      <div>
                        <button
                          onClick={() => toggleCoverLetter(app._id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <FileText className="h-4 w-4" />
                          <span>{isExpanded ? 'Hide Cover Letter' : 'Show Cover Letter'}</span>
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-4 rounded-xl border border-slate-850 bg-slate-950/65 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-1.5 duration-200">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-900 pb-1.5">Submitted Cover Letter</h4>
                            {app.coverLetter}
                          </div>
                        )}
                      </div>
                    )}
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

export default Applications;
