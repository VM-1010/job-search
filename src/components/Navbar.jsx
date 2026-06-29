import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Briefcase, User, LogOut, ChevronDown, Compass, BookOpen, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, accountType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-600 text-white'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
                <Briefcase className="h-5.5 w-5.5" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                JobSphere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <Link to="/jobs" className={linkClass('/jobs')}>
              Find Jobs
            </Link>
            <Link to="/companies" className={linkClass('/companies')}>
              Companies
            </Link>

            {isAuthenticated ? (
              <>
                {accountType === 'seeker' ? (
                  <>
                    <Link to="/dashboard" className={linkClass('/dashboard')}>
                      Dashboard
                    </Link>
                    <Link to="/applications" className={linkClass('/applications')}>
                      My Applications
                    </Link>
                    <Link to="/saved-jobs" className={linkClass('/saved-jobs')}>
                      Saved Jobs
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/recruiter/dashboard" className={linkClass('/recruiter/dashboard')}>
                      Dashboard
                    </Link>
                    <Link to="/recruiter/jobs" className={linkClass('/recruiter/jobs')}>
                      Manage Jobs
                    </Link>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative ml-3">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-slate-700 focus:outline-none"
                  >
                    <span className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                      {accountType === 'seeker' 
                        ? user.name?.[0] || 'U'
                        : user.recruiterName?.[0] || 'R'
                      }
                    </span>
                    <span className="max-w-[100px] truncate">
                      {accountType === 'seeker' ? user.name : user.recruiterName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl ring-1 ring-black ring-opacity-5">
                      {accountType === 'seeker' ? (
                        <Link
                          to="/profile"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          My Profile
                        </Link>
                      ) : (
                        <Link
                          to="/recruiter/company"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                        >
                          <Layers className="h-4 w-4 text-slate-400" />
                          Company Profile
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <Link
                  to="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-purple-700"
                >
                  Join JobSphere
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-850 bg-slate-900 px-2 py-3 space-y-1.5 md:hidden">
          <Link to="/jobs" onClick={() => setIsOpen(false)} className={mobileLinkClass('/jobs')}>
            Find Jobs
          </Link>
          <Link to="/companies" onClick={() => setIsOpen(false)} className={mobileLinkClass('/companies')}>
            Companies
          </Link>

          {isAuthenticated ? (
            <>
              {accountType === 'seeker' ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={mobileLinkClass('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/applications" onClick={() => setIsOpen(false)} className={mobileLinkClass('/applications')}>
                    My Applications
                  </Link>
                  <Link to="/saved-jobs" onClick={() => setIsOpen(false)} className={mobileLinkClass('/saved-jobs')}>
                    Saved Jobs
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className={mobileLinkClass('/profile')}>
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/recruiter/dashboard" onClick={() => setIsOpen(false)} className={mobileLinkClass('/recruiter/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/recruiter/jobs" onClick={() => setIsOpen(false)} className={mobileLinkClass('/recruiter/jobs')}>
                    Manage Jobs
                  </Link>
                  <Link to="/recruiter/company" onClick={() => setIsOpen(false)} className={mobileLinkClass('/recruiter/company')}>
                    Company Profile
                  </Link>
                </>
              )}
              <div className="border-t border-slate-800 mt-3 pt-3 px-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold uppercase text-white">
                    {accountType === 'seeker' ? user.name?.[0] : user.recruiterName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {accountType === 'seeker' ? user.name : user.recruiterName}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-base font-medium text-red-400 transition-all hover:bg-red-500/20"
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-slate-800 mt-3 pt-3 px-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-slate-800 py-2.5 text-base font-semibold text-white hover:bg-slate-700 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-base font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                Join JobSphere
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
