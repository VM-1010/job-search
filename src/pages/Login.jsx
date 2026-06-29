import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Chrome, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path or default based on role
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    try {
      const data = await login(email, password);
      
      // Determine where to navigate
      const role = data.accountType;
      const defaultPath = role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
      const redirectPath = from || defaultPath;
      
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem-12rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Authentication Failed</p>
              <p className="mt-1 text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formLoading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-650 hover:to-purple-750 focus:outline-none disabled:opacity-50 transition-all items-center gap-2"
            >
              {formLoading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-slate-900 px-4 text-slate-400 rounded-md border border-slate-800/50">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 transition-colors"
          >
            <Chrome className="h-5 w-5 text-indigo-400" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
