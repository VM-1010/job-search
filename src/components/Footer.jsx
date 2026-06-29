import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                JobSphere
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting professional talents with high-growth companies. Discover opportunities, accelerate your career, and manage your recruits all in one place.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Seekers */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">Browse Companies</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Seeker Dashboard</Link>
              </li>
              <li>
                <Link to="/saved-jobs" className="hover:text-white transition-colors">Saved Positions</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links - Recruiters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Post a Job</Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Dashboard</Link>
              </li>
              <li>
                <Link to="/recruiter/jobs" className="hover:text-white transition-colors">Manage Postings</Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">Recruit Talents</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Stay Updated</h3>
            <p className="text-sm text-slate-400">
              Subscribe to get the latest job postings and career tips.
            </p>
            <form className="flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Enter email..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobSphere. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
