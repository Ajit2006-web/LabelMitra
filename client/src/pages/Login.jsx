import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = new URLSearchParams(location.search).get('session_expired');
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate(redirectTo);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-18rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-forest-900 border border-forest-700/90 rounded-card shadow-2xl p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle gold decorative accent top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"></div>

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-forest-850 border border-gold-500/40 rounded-button flex items-center justify-center text-gold-500 mx-auto mb-3.5 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-ivory-100">
              Sign In to LabelMitra
            </h1>
            <p className="text-xs text-sage-400 mt-1.5 leading-relaxed">
              Access your personalized allergy profile and food intelligence history
            </p>
          </div>

          {sessionExpired && (
            <div className="mb-6 p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-button text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span>Your session has expired. Please log in again to continue.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-button text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field-forest"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field-forest"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gold py-3 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-forest-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-forest-950" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-forest-750 text-center text-xs text-sage-400">
            <span>Do not have an account yet? </span>
            <Link
              to="/register"
              className="font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-2"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
