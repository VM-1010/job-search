import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Building, ShieldCheck, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              The Next-Gen Job Board
            </span>
          </div>
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Find your <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">dream job</span> without the friction.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-455 text-slate-350">
            JobSphere connects elite developers and tech professionals with top-tier companies. Explore tailored opportunities or list your company's roles to find verified talent today.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/jobs"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center gap-2"
            >
              Browse Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="text-sm font-semibold leading-6 text-white hover:text-indigo-400 transition-colors">
              Post a job <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32 items-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:w-[500px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Targeted Match</h3>
              <p className="mt-2 text-sm text-slate-400">
                Tailored job listings filtered by skills, experience level, and preferred tech stack.
              </p>
            </div>
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Verified Profiles</h3>
              <p className="mt-2 text-sm text-slate-400">
                Submit immutable profile snapshots that accurately showcase your expertise.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Company Spaces</h3>
              <p className="mt-2 text-sm text-slate-400">
                Dedicated company profile pages managed by authorized recruiters.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
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
      </div>

      {/* Stats Section */}
      <div className="border-t border-slate-850 bg-slate-900/30 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Jobs Posted Monthly</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">12,000+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Verified Recruiters</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">4,500+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Successful Matches</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">98%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Home;
