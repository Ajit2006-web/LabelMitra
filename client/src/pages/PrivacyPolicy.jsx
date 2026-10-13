import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="bg-forest-900 border border-forest-700/90 rounded-card p-8 sm:p-12 shadow-xl">
        <div className="flex items-center gap-3.5 pb-6 border-b border-forest-700/80 mb-8">
          <div className="w-10 h-10 rounded-button bg-forest-850 border border-gold-500/40 flex items-center justify-center text-gold-500">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-100">Privacy Policy</h1>
            <p className="text-xs text-gold-500 font-mono mt-0.5">LabelMitra — AI-Powered Food Label Analysis</p>
          </div>
        </div>

        <div className="space-y-7 text-xs sm:text-sm text-sage-300 leading-relaxed">
          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">1. Information We Collect</h2>
            <p>
              LabelMitra collects only the minimal data required to provide personalized food label analysis:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-sage-400">
              <li><strong className="text-ivory-100">Account Credentials:</strong> Email address and hashed password for secure authentication.</li>
              <li><strong className="text-ivory-100">User Profile Data:</strong> Stated dietary preferences (e.g. Vegetarian, Vegan), registered food allergies, and nutritional priorities.</li>
              <li><strong className="text-ivory-100">Uploaded Food Images:</strong> Product packaging images provided by the user for OCR extraction and compliance auditing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">2. How Information is Used</h2>
            <p>
              Your personal profile data is strictly utilized to tailor automated safety checks:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs text-sage-400">
              <li>Matching extracted package ingredients against registered food allergies with synonym resolution.</li>
              <li>Filtering alternative product recommendations according to dietary and nutritional priorities.</li>
              <li>Generating pre-filled grievance draft texts when you request official FSSAI complaint assistance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">3. Data Storage & Security</h2>
            <p>
              All user records are maintained in a secured PostgreSQL database. Passwords are irreversibly hashed using bcrypt. We do not sell personal data, track users across third-party networks, or use your uploaded packaging imagery for commercial advertising.
            </p>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">4. User Rights & Data Deletion</h2>
            <p>
              You maintain full control over your allergy records, nutrition priorities, and personal preferences. You can update or delete your allergies and preferences at any time via the User Profile page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
