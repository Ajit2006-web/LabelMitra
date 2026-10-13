import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, LogOut, LogIn, UserPlus, ScanLine } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-forest-950/95 backdrop-blur-md text-ivory-100 border-b border-forest-700/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-button bg-forest-900 border border-gold-500/40 flex items-center justify-center text-gold-500 shadow-sm group-hover:border-gold-500 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold tracking-tight text-ivory-100 block leading-none">
                LabelMitra
              </span>
              <span className="text-[11px] uppercase tracking-widest text-gold-500 font-medium hidden sm:block mt-1">
                Your Friendly Guide to Food Labels
              </span>
            </div>
          </Link>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Scan — primary action for authenticated users */}
                <Link
                  to="/scan"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-button transition-colors ${
                    isActive('/scan')
                      ? 'bg-gold-500 text-forest-950'
                      : 'bg-forest-900 hover:bg-gold-500/10 text-gold-400 hover:text-gold-300 border border-gold-500/30 hover:border-gold-500/60'
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Scan Label</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-button transition-colors ${
                    isActive('/profile')
                      ? 'bg-forest-800 border border-forest-700 text-ivory-100'
                      : 'text-sage-300 hover:text-ivory-100 hover:bg-forest-850 border border-transparent hover:border-forest-700'
                  }`}
                >
                  <User className="w-4 h-4 text-gold-500" />
                  <span>Profile</span>
                </Link>

                <div className="h-5 w-px bg-forest-700 mx-1"></div>
                <div className="text-xs text-sage-400 hidden md:block">
                  <span>Hi, </span>
                  <span className="font-medium text-ivory-100">{user?.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 rounded-button transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-sage-300 hover:text-ivory-100 hover:bg-forest-850 rounded-button transition-colors"
                >
                  <LogIn className="w-4 h-4 text-gold-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-gold text-xs uppercase tracking-wider px-5 py-2.5 font-semibold"
                >
                  <UserPlus className="w-4 h-4 text-forest-950" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
