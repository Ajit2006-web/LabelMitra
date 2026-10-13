import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ScanPage from './pages/ScanPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route
                path="*"
                element={
                  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-3xl font-bold text-slate-900">404 - Page Not Found</h1>
                    <p className="text-sm text-slate-500 mt-2">The requested page does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
