import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  User, 
  ShieldCheck, 
  FileText, 
  Bookmark, 
  Send, 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch seeker dashboard data
  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'user'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/user');
      return response.data;
    }
  });

  // Unsave job mutation
  const unsaveMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await api.delete(`/api/users/saved-jobs/${jobId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
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
        <p className="text-slate-400 text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Dashboard Failed to Load</h1>
        <p className="mt-4 max-w-md text-slate-400">
          {error?.response?.data?.message || error?.message || 'We had trouble retrieving your dashboard data.'}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard', 'user'] })}
          className="mt-8 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    recentApplications = [],
    savedJobs = [],
    totalApplications = 0,
    applicationsByStatus = {},
    profileCompletionPercentage = 0
  } = dashboardData || {};

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
        {status}
      </span>
    );
  };

  const getCompanyInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'CO';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Seeker Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Welcome back, {user?.name || 'Job Seeker'}!</p>
          </div>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 text-slate-200 transition-colors"
        >
          <User className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Completion Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Completion</span>
              <span className="text-lg font-bold text-indigo-400">{profileCompletionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${profileCompletionPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            {profileCompletionPercentage < 80 
              ? 'Complete your education, experience, and certifications to stand out to recruiters.' 
              : 'Excellent! Your profile looks highly professional and ready for submissions.'}
          </p>
        </div>

        {/* Application Stats Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Application Status</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
              {totalApplications}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-905">
              <span className="block text-lg font-bold text-white">{applicationsByStatus['Interview'] || 0}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Interviews</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-905">
              <span className="block text-lg font-bold text-emerald-400">{applicationsByStatus['Accepted'] || 0}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase text-emerald-500/70">Offers</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-905">
              <span className="block text-lg font-bold text-purple-400">{applicationsByStatus['Shortlisted'] || 0}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase text-purple-500/70">Shortlists</span>
            </div>
          </div>
        </div>

        {/* Quick Save Stats Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bookmarks</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
              {savedJobs.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            You have {savedJobs.length} jobs bookmarked. Complete your profile before applying.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              to="/saved-jobs"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View Saved Jobs
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Applications and Saved Jobs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Applications list */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-indigo-400" />
                Recent Applications
              </h2>
              {recentApplications.length > 0 && (
                <Link
                  to="/applications"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 mx-auto text-slate-500 mb-4">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-white">No applications sent</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  You haven't submitted any job applications yet.
                </p>
                <Link
                  to="/jobs"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  Browse Jobs
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-850">
                {recentApplications.map((app) => {
                  const job = app.job || {};
                  const company = app.company || {};
                  return (
                    <div key={app._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Link to={`/company/${company._id}`} className="shrink-0">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.companyName}
                              className="h-10 w-10 rounded-xl object-cover border border-slate-800 bg-slate-950"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-xs">
                              {getCompanyInitials(company.companyName)}
                            </div>
                          )}
                        </Link>
                        <div>
                          <h4 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                            <Link to={`/job/${job._id}`}>{job.title || 'Job Position'}</Link>
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>{company.companyName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 text-slate-500" />
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Jobs list */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-indigo-400" />
                Saved Positions
              </h2>
              {savedJobs.length > 0 && (
                <Link
                  to="/saved-jobs"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {savedJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 mx-auto text-slate-500 mb-4">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-white">No bookmarked jobs</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Keep track of positions you are interested in.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-850">
                {savedJobs.map((item) => {
                  const job = item.job || {};
                  // company name may be on company or populated company field. Let's make sure it handles safely.
                  const companyObj = job.company || {};
                  return (
                    <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                          <Link to={`/job/${job._id}`}>{job.title || 'Job Position'}</Link>
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          {companyObj.companyName && (
                            <>
                              <span>{companyObj.companyName}</span>
                              <span>•</span>
                            </>
                          )}
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-400 font-semibold">{job.employmentType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => unsaveMutation.mutate(job._id)}
                          disabled={unsaveMutation.isPending}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-450 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
                          title="Remove bookmark"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/job/${job._id}`}
                          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                          title="Apply now"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Suggestions & Status Summary */}
        <div className="space-y-6">
          {/* Suggestions checklist */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Complete Profile
            </h3>
            <div className="space-y-3.5">
              {profileCompletionPercentage < 100 ? (
                <>
                  <div className="flex gap-3 text-xs text-slate-450 font-medium">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${user?.profile?.headline ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className={user?.profile?.headline ? 'text-slate-300' : 'text-slate-450'}>Add Headline</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-450 font-medium">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${user?.profile?.about ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className={user?.profile?.about ? 'text-slate-300' : 'text-slate-450'}>Write about section</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-450 font-medium">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${user?.profile?.location ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className={user?.profile?.location ? 'text-slate-300' : 'text-slate-450'}>Specify location</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-450 font-medium">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${user?.profile?.education?.length > 0 ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className={user?.profile?.education?.length > 0 ? 'text-slate-300' : 'text-slate-450'}>Add Education history</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-450 font-medium">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${user?.profile?.experience?.length > 0 ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className={user?.profile?.experience?.length > 0 ? 'text-slate-300' : 'text-slate-450'}>Add Experience history</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-450 font-medium">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${user?.profile?.skills?.length > 0 ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className={user?.profile?.skills?.length > 0 ? 'text-slate-300' : 'text-slate-450'}>Add key skills</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 text-center font-medium leading-relaxed">
                  🎉 Fantastic! Your profile is 100% complete and fully optimized for top recruiter matches.
                </div>
              )}
            </div>
          </div>

          {/* User Details Details Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Account Information</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Registered Email</span>
                <span className="text-white font-semibold mt-0.5 block truncate">{user?.email}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Account Class</span>
                <span className="text-white font-semibold mt-0.5 block capitalize">{user?.accountType || 'Seeker'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Member Since</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
