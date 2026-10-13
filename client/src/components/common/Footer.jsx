import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-sage-400 text-sm border-t border-forest-700/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-forest-700/60">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-button bg-forest-900 border border-gold-500/40 flex items-center justify-center text-gold-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-serif font-bold text-ivory-100 tracking-tight">LabelMitra</span>
            </div>
            <p className="text-xs text-sage-400 leading-relaxed max-w-sm">
              Your Friendly Guide to Food Labels. AI-powered label analysis, FSSAI regulatory compliance verification, personalized allergen detection, and evidence-backed nutritional insights for Indian packaged foods.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
              Regulatory Information & Policies
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/privacy-policy" className="hover:text-gold-400 text-sage-300 transition-colors flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gold-600" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-400 text-sage-300 transition-colors flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gold-600" />
                  <span>Terms and Conditions</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/scan" className="hover:text-gold-400 text-sage-300 transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>Scan a Food Label</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-gold-400 text-sage-300 transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                  <span>Allergy &amp; Diet Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gold-400 text-sage-300 transition-colors flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gold-600" />
                  <span>Create Account</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">
              Compliance & Safety Notice
            </h4>
            <p className="text-xs text-sage-400 leading-relaxed">
              LabelMitra is an explainable decision support system designed for educational and informational purposes. It does not provide medical diagnosis or legally binding compliance certifications. Always verify physical packaging labels directly.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-sage-500 gap-4">
          <p>© {new Date().getFullYear()} LabelMitra. All rights reserved.</p>
          <p className="text-sage-500">Built for Indian Packaged Food Products in compliance with FSSAI statutory standards.</p>
        </div>
      </div>
    </footer>
  );
}
