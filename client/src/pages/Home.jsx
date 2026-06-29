import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import CompanyCard from '../components/CompanyCard';
import { Briefcase, Users, Building, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = ({ search, location }) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  // Fetch featured jobs (limit to 3)
  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    isError: isErrorJobs,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['featuredJobs'],
    queryFn: async () => {
      const response = await api.get('/jobs', { params: { limit: 3 } });
      return response.data;
    }
  });

  // Fetch featured companies (limit to 3)
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
    error: companiesError,
    refetch: refetchCompanies
  } = useQuery({
    queryKey: ['featuredCompanies'],
    queryFn: async () => {
      const response = await api.get('/companies', { params: { limit: 3 } });
      return response.data;
    }
  });

  const featuredJobs = jobsData?.jobs || [];
  const featuredCompanies = companiesData?.companies || [];

  return (
    <div className="relative isolate overflow-hidden bg-slate-950 min-h-screen">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-20 sm:pb-24 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            The Next-Gen Job Board
          </span>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
            Find your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">dream job</span> without the friction.
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            JobSphere connects elite developers and tech professionals with top-tier companies. Explore tailored opportunities or list your company's roles to find verified talent today.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              to="/jobs"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center gap-2"
            >
              Browse Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="text-sm font-semibold leading-6 text-white hover:text-indigo-400 transition-colors">
              Post a job <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Targeted Match</h3>
            <p className="mt-2 text-sm text-slate-400">
              Tailored job listings filtered by skills, experience level, and preferred tech stack.
            </p>
          </div>
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Verified Profiles</h3>
            <p className="mt-2 text-sm text-slate-400">
              Submit immutable profile snapshots that accurately showcase your expertise.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Company Spaces</h3>
            <p className="mt-2 text-sm text-slate-400">
              Dedicated company profile pages managed by authorized recruiters.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Role-Based Access</h3>
            <p className="mt-2 text-sm text-slate-400">
              Secure JWT-based authentication and routing custom-tailored for recruiters and seekers.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Featured Jobs</h2>
            <p className="mt-2 text-sm text-slate-400">Latest job opportunities posted on our platform</p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            All Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoadingJobs ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : isErrorJobs ? (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-6 text-center text-red-400 flex flex-col items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm font-medium">Failed to load featured jobs: {jobsError?.message || 'Server error'}</p>
            <button
              onClick={refetchJobs}
              className="mt-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              Retry
            </button>
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-12 text-center text-slate-400">
            <Briefcase className="h-10 w-10 mx-auto text-slate-600 mb-4" />
            <h3 className="font-bold text-white mb-1">No Jobs Posted Yet</h3>
            <p className="text-sm max-w-sm mx-auto text-slate-400">Be the first recruiter to post jobs and find great talent!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Companies Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Featured Companies</h2>
            <p className="mt-2 text-sm text-slate-400">Top-tier organizations posting active listings</p>
          </div>
          <Link
            to="/companies"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            All Companies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoadingCompanies ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : isErrorCompanies ? (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-6 text-center text-red-400 flex flex-col items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm font-medium">Failed to load featured companies: {companiesError?.message || 'Server error'}</p>
            <button
              onClick={refetchCompanies}
              className="mt-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              Retry
            </button>
          </div>
        ) : featuredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-12 text-center text-slate-400">
            <Building className="h-10 w-10 mx-auto text-slate-600 mb-4" />
            <h3 className="font-bold text-white mb-1">No Companies Registered Yet</h3>
            <p className="text-sm max-w-sm mx-auto text-slate-400">Join as a recruiter to create a company profile today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCompanies.map((company) => (
              <CompanyCard key={company.company?._id || company._id} company={company} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="border-t border-slate-900 bg-slate-900/20 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Jobs Posted Monthly</dt>
              <dd className="order-first text-4xl font-extrabold tracking-tight text-white sm:text-5xl">12,000+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Verified Recruiters</dt>
              <dd className="order-first text-4xl font-extrabold tracking-tight text-white sm:text-5xl">4,500+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Successful Matches</dt>
              <dd className="order-first text-4xl font-extrabold tracking-tight text-white sm:text-5xl">98%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Home;
