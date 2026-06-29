import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Briefcase, Image, ArrowRight } from 'lucide-react';

const RegisterRecruiter = () => {
  const [recruiterName, setRecruiterName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { registerRecruiter } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const payload = {
      recruiterName,
      email,
      password,
      ...(title && { title }),
      ...(profilePicture && { profilePicture }),
    };

    try {
      await registerRecruiter(payload);
      // Navigate recruiters to dashboard/onboarding
      navigate('/recruiter/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem-12rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-white">
            Create Recruiter Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Hire developers and post jobs, or{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              change account type
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Registration Failed</p>
              <p className="mt-1 text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="recruiter-name" className="block text-sm font-medium text-slate-300 mb-1">
                Company Name / Recruiter Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="recruiter-name"
                  name="recruiterName"
                  type="text"
                  required
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Rita Recruiter"
                />
              </div>
            </div>

            <div>
              <label htmlFor="recruiter-email" className="block text-sm font-medium text-slate-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="recruiter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="rita@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="recruiter-password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="recruiter-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="•••••••• (Min 6 chars)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="recruiter-title" className="block text-sm font-medium text-slate-300 mb-1">
                Job Title <span className="text-xs text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Briefcase className="h-5 w-5" />
                </span>
                <input
                  id="recruiter-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Talent Acquisition Lead"
                />
              </div>
            </div>

            <div>
              <label htmlFor="recruiter-avatar" className="block text-sm font-medium text-slate-300 mb-1">
                Avatar URL <span className="text-xs text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Image className="h-5 w-5" />
                </span>
                <input
                  id="recruiter-avatar"
                  name="profilePicture"
                  type="url"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-650 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:from-purple-650 hover:to-indigo-750 focus:outline-none disabled:opacity-50 transition-all items-center gap-2"
            >
              {formLoading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Recruiter
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterRecruiter;
