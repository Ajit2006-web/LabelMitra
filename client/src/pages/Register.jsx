import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dietaryPreference: 'VEGETARIAN',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        dietaryPreference: formData.dietaryPreference,
      });
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
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
              Create LabelMitra Account
            </h1>
            <p className="text-xs text-sage-400 mt-1.5 leading-relaxed">
              Start analyzing food labels with personalized safety checks
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-button text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="input-field-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="input-field-forest"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Dietary Preference
              </label>
              <select
                name="dietaryPreference"
                value={formData.dietaryPreference}
                onChange={handleChange}
                className="input-field-forest bg-forest-900"
              >
                <option value="VEGETARIAN">Vegetarian (Default)</option>
                <option value="VEGAN">Vegan</option>
                <option value="EGGETARIAN">Eggetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Password (min. 6 characters)
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="input-field-forest"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sage-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input-field-forest"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gold py-3 mt-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-forest-950" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-forest-950" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-forest-750 text-center text-xs text-sage-400">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
