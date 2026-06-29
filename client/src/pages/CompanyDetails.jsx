import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import JobCard from '../components/JobCard';
import {
  Building,
  MapPin,
  Globe,
  Mail,
  Calendar,
  Users,
  ChevronLeft,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';

const CompanyDetails = () => {
  const { id } = useParams();

  // Fetch company profile details
  const {
    data: companyResponse,
    isLoading: isLoadingCompany,
    isError: isErrorCompany,
    error: companyError,
    refetch: refetchCompany
  } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    }
  });

  // Fetch company open jobs
  const {
    data: jobs = [],
    isLoading: isLoadingJobs,
    isError: isErrorJobs,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['companyJobs', id],
    queryFn: async () => {
      const response = await api.get(`/companies/${id}/jobs`);
      return response.data;
    }
  });

  if (isLoadingCompany) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading company profile...</p>
      </div>
    );
  }

  if (isErrorCompany || !companyResponse) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Company Failed to Load</h1>
        <p className="mt-4 max-w-md text-slate-400">
          {companyError?.response?.data?.message || companyError?.message || 'The company profile could not be retrieved.'}
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            to="/companies"
            className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Companies
          </Link>
          <button
            onClick={refetchCompany}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { company, activeJobsCount, recruiterCount } = companyResponse;
  const {
    companyName = 'Unknown Company',
    logo = '',
    banner = '',
    description = '',
    industry = 'Technology',
    headquarters = 'Remote',
    website = '',
    foundedYear = '',
    companySize = '',
    contactEmail = '',
    socialLinks = {},
    recruiters = []
  } = company || {};

  const getCompanyInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'CO';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-white min-h-screen">
      {/* Back Button */}
      <Link
        to="/companies"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to directory
      </Link>

      {/* Company Banner & Profile Header */}
      <div className="relative rounded-3xl border border-slate-800 bg-slate-900/30 overflow-hidden mb-8 backdrop-blur-md">
        {/* Banner Area */}
        <div className="h-40 md:h-52 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 relative border-b border-slate-800">
          {banner && banner !== '' && (
            <img src={banner} alt={`${companyName} banner`} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-slate-950/20" />
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-10 md:-mt-12 gap-5 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Logo */}
              <div className="shrink-0 relative z-10">
                {logo ? (
                  <img
                    src={logo}
                    alt={companyName}
                    className="h-20 w-20 md:h-24 md:w-24 rounded-2xl object-cover border-2 border-slate-800 bg-slate-950"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {(!logo || logo === '') ? (
                  <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-extrabold border-2 border-slate-850 text-xl">
                    {getCompanyInitials(companyName)}
                  </div>
                ) : (
                  <div style={{ display: 'none' }} className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-400 font-extrabold border-2 border-slate-850 text-xl">
                    {getCompanyInitials(companyName)}
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">{companyName}</h1>
                <p className="text-indigo-400 font-medium text-sm mt-0.5">{industry}</p>
              </div>
            </div>

            {/* Social Links & Website */}
            <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-650 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-all shadow-md shadow-indigo-650/15 cursor-pointer"
                >
                  Website
                  <ExternalLink className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-3 sm:flex sm:items-center sm:gap-6 mt-6 border-t border-slate-850 pt-5 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-slate-500" />
              <span>{headquarters}</span>
            </div>
            {foundedYear && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-slate-500" />
                <span>Founded in {foundedYear}</span>
              </div>
            )}
            {companySize && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-slate-500" />
                <span>{companySize} Employees</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Building className="h-4.5 w-4.5 text-slate-500" />
              <span>
                <strong className="text-white font-semibold">{activeJobsCount}</strong> Active Roles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side (2/3): Description & Recruiters Team */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About/Description */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-b border-slate-850 pb-3 mb-4">About Us</h2>
            <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-line">
              {description || 'No detailed description available for this company yet.'}
            </p>
          </div>

          {/* Team / Recruiters List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white border-b border-slate-850 pb-3 mb-6">Our Hiring Team</h2>
            
            {recruiters.length === 0 ? (
              <p className="text-sm text-slate-400">No recruiters associated with this company yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recruiters.map((recruiter) => (
                  <div
                    key={recruiter._id}
                    className="flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950 p-4"
                  >
                    {recruiter.profilePicture ? (
                      <img
                        src={recruiter.profilePicture}
                        alt={recruiter.recruiterName}
                        className="h-11 w-11 rounded-lg object-cover border border-slate-850"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold border border-slate-800 text-xs">
                        {recruiter.recruiterName ? recruiter.recruiterName[0].toUpperCase() : 'R'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{recruiter.recruiterName}</h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{recruiter.title || 'Recruiter'}</p>
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-1 truncate">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <a href={`mailto:${recruiter.email}`} className="hover:text-indigo-400 transition-colors truncate">
                          {recruiter.email}
                        </a>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side (1/3): Company's Open Jobs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white border-b border-slate-850 pb-3 mb-5 flex items-center justify-between">
              <span>Open Positions</span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400 font-bold">
                {jobs.length}
              </span>
            </h2>

            {isLoadingJobs ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-32 rounded-xl bg-slate-950 border border-slate-850 animate-pulse" />
                ))}
              </div>
            ) : isErrorJobs ? (
              <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 text-center text-red-400">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-xs">Failed to load open positions.</p>
                <button
                  onClick={refetchJobs}
                  className="mt-2 text-xs text-indigo-455 text-indigo-400 hover:underline font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <Building className="h-8 w-8 mx-auto text-slate-700 mb-2.5" />
                <p className="text-sm font-semibold text-slate-400">No Open Jobs</p>
                <p className="text-xs text-slate-500 mt-1 px-4">There are currently no active job postings for this company.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="group border border-slate-850 bg-slate-950 p-4 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                      <Link to={`/job/${job._id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{job.location} • {job.employmentType}</p>
                    <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
                      <span>{job.salaryRange || 'Competitive Salary'}</span>
                      <Link
                        to={`/job/${job._id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
