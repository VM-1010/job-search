import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ArrowRight } from 'lucide-react';

const Register = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem-12rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-950">
      <div className="w-full max-w-3xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Join JobSphere
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Select your account type to get started. Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Job Seeker Card */}
          <div className="group relative rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 group-hover:bg-indigo-500/20 transition-all">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Job Seeker</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Find developer jobs, build a professional profile, save postings, apply with single-click applications, and track application status in real-time.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/register/seeker"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-650/20 hover:bg-indigo-500 transition-all"
              >
                Sign Up as Seeker
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Recruiter Card */}
          <div className="group relative rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900/50 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-6 group-hover:bg-purple-500/20 transition-all">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Employer / Recruiter</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Create a company space, list open job positions, manage candidate pipelines, review applications, and contact applicants directly.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/register/recruiter"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-650/20 hover:bg-purple-500 transition-all"
              >
                Sign Up as Employer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
