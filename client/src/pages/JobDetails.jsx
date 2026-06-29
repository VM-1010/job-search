import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  User,
  Mail,
  ExternalLink,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Loader2
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, accountType } = useAuth();
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch job details
  const {
    data: job,
    isLoading: isLoadingJob,
    isError: isErrorJob,
    error: jobError,
    refetch: refetchJob
  } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    }
  });

  // Fetch seeker applications if logged in as seeker
  const {
    data: myApplications = [],
    isLoading: isLoadingApps
  } = useQuery({
    queryKey: ['applications', 'mine'],
    queryFn: async () => {
      const response = await api.get('/applications/my-applications');
      return response.data;
    },
    enabled: isAuthenticated && accountType === 'seeker'
  });

  // Check if seeker already applied to this job
  const hasApplied = myApplications.some((app) => {
    const appId = app.job?._id || app.job;
    return appId === id;
  });

  // Mutation for applying to a job
  const applyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/applications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine'] });
      setSuccessMessage('Your application has been submitted successfully!');
      setIsApplyModalOpen(false);
      setCoverLetter('');
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    }
  });

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/job/${id}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    if (coverLetter.trim().length < 10) {
      setFormError('Cover letter must be at least 10 characters.');
      return;
    }

    applyMutation.mutate({
      jobId: id,
      coverLetter
    });
  };

  if (isLoadingJob) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading job details...</p>
      </div>
    );
  }

  if (isErrorJob) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Job Details Failed to Load</h1>
        <p className="mt-4 max-w-md text-slate-400">
          {jobError?.response?.data?.message || jobError?.message || 'The job listing could not be retrieved.'}
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            to="/jobs"
            className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Jobs
          </Link>
          <button
            onClick={refetchJob}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mb-6">
          <Briefcase className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Job Not Found</h1>
        <p className="mt-4 max-w-md text-slate-400">
          This job posting does not exist or has been removed.
        </p>
        <Link
          to="/jobs"
          className="mt-8 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors"
        >
          Browse All Jobs
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    requirements,
    responsibilities,
    skills = [],
    salaryRange,
    employmentType,
    experienceLevel,
    location,
    company = {},
    recruiter = {},
    status,
    createdAt
  } = job;

  const isClosed = status === 'Closed';

  const getCompanyInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'CO';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-screen">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to listings
      </Link>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-center justify-between text-emerald-400 text-sm font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-500 hover:text-emerald-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Job Main Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/30 p-8 md:p-10 mb-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            {/* Logo */}
            <Link to={`/company/${company._id}`} className="shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.companyName}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-800 bg-slate-950"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {(!company.logo || company.logo === '') ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-lg">
                  {getCompanyInitials(company.companyName)}
                </div>
              ) : (
                <div style={{ display: 'none' }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-bold border border-slate-800 text-lg">
                  {getCompanyInitials(company.companyName)}
                </div>
              )}
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white md:text-3xl tracking-tight">{title}</h1>
                {isClosed ? (
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
                    Closed
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                )}
              </div>
              
              <p className="text-base font-semibold text-indigo-400 mt-1.5">
                <Link to={`/company/${company._id}`} className="hover:underline">
                  {company.companyName}
                </Link>
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {location}
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  {employmentType} • {experienceLevel}
                </span>
                {salaryRange && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      {salaryRange}
                    </span>
                  </>
                )}
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Posted {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* CTA Action card in Header */}
          <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row shrink-0 mt-4 md:mt-0">
            {isClosed ? (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-semibold text-sm cursor-not-allowed"
              >
                Applications Closed
              </button>
            ) : accountType === 'recruiter' ? (
              <div className="text-xs text-slate-500 font-medium bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 max-w-[200px] text-center">
                Recruiter accounts cannot apply to job postings.
              </div>
            ) : hasApplied ? (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Applied
              </button>
            ) : (
              <button
                onClick={handleApplyClick}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply for Job
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2/3): Job Core Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Job Description */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-b border-slate-850 pb-3 mb-4">Job Description</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {description}
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-b border-slate-850 pb-3 mb-4">Requirements</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {requirements}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-b border-slate-850 pb-3 mb-4">Responsibilities</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {responsibilities}
            </div>
          </div>

          {/* Key Skills Tags */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-b border-slate-850 pb-3 mb-4">Key Skills Needed</h2>
            <div className="flex flex-wrap gap-2.5 mt-4">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Company & Recruiter Cards */}
        <div className="space-y-6">
          
          {/* Company Quick Details Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
              <Building className="h-5 w-5 text-indigo-400" />
              <h2 className="font-bold text-white text-lg">About the Company</h2>
            </div>
            
            <h3 className="font-extrabold text-white text-base">
              <Link to={`/company/${company._id}`} className="hover:text-indigo-400 transition-colors">
                {company.companyName}
              </Link>
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{company.description || 'No description provided.'}</p>
            
            <div className="space-y-3.5 mt-5 border-t border-slate-850 pt-4 text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Industry</span>
                <span className="font-medium">{company.industry || 'Tech'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Headquarters</span>
                <span className="font-medium">{company.headquarters || 'Remote'}</span>
              </div>
              {company.foundedYear && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Founded</span>
                  <span className="font-medium">{company.foundedYear}</span>
                </div>
              )}
              {company.companySize && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Company Size</span>
                  <span className="font-medium">{company.companySize} employees</span>
                </div>
              )}
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                Visit Website
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Recruiter Details Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
              <User className="h-5 w-5 text-purple-400" />
              <h2 className="font-bold text-white text-lg">Job Poster</h2>
            </div>

            <div className="flex items-center gap-4">
              {recruiter.profilePicture ? (
                <img
                  src={recruiter.profilePicture}
                  alt={recruiter.recruiterName}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-800"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-bold border border-slate-800 text-sm">
                  {recruiter.recruiterName ? recruiter.recruiterName[0].toUpperCase() : 'R'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-white text-base">{recruiter.recruiterName || 'Alice Recruiter'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{recruiter.title || 'Recruitment Lead'}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-850 pt-4 flex items-center gap-2 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <a href={`mailto:${recruiter.email}`} className="hover:text-indigo-400 transition-colors truncate">
                {recruiter.email || 'hr@company.com'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-850 bg-slate-900 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-2">Apply for {title}</h2>
            <p className="text-sm text-slate-400 mb-6">
              at <strong className="text-slate-200">{company.companyName}</strong>. Please provide a brief cover letter.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cover Letter (minimum 10 characters)
                </label>
                <textarea
                  required
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you are a great fit for this position..."
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-4 justify-end mt-8 border-t border-slate-850 pt-4">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
