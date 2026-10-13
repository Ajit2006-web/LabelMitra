import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="bg-forest-900 border border-forest-700/90 rounded-card p-8 sm:p-12 shadow-xl">
        <div className="flex items-center gap-3.5 pb-6 border-b border-forest-700/80 mb-8">
          <div className="w-10 h-10 rounded-button bg-forest-850 border border-gold-500/40 flex items-center justify-center text-gold-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-100">Terms and Conditions</h1>
            <p className="text-xs text-gold-500 font-mono mt-0.5">LabelMitra — AI-Powered Food Label Analysis</p>
          </div>
        </div>

        <div className="space-y-7 text-xs sm:text-sm text-sage-300 leading-relaxed">
          <section className="p-4 bg-forest-950 border border-gold-500/30 rounded-button">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
              <p className="text-xs text-ivory-100 font-medium leading-relaxed">
                <strong className="text-gold-400">Important Decision Support Notice:</strong> LabelMitra is an educational and analytical decision-support system. It does not provide medical advice, diagnosis, clinical guarantees, or statutory legal certifications.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">1. Scope of Service</h2>
            <p>
              LabelMitra provides automated OCR extraction, heuristic information structuring, rule-based FSSAI compliance verification, and ingredient allergy cross-referencing for Indian packaged food products.
            </p>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">2. Accuracy & Direct Package Verification</h2>
            <p>
              Optical Character Recognition (OCR) and automated NLP extraction are subject to packaging wear, curvature, glare, and resolution limitations. Users are strongly advised to inspect the physical package label and verify ingredients directly before consuming food products.
            </p>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">3. No Medical or Legal Authority</h2>
            <p>
              The platform does not guarantee that any food item is allergen-free or safe for specific clinical conditions. Regulatory compliance findings are labeled as "Potential compliance issue detected" and do not constitute an official accusation or administrative penalty against any food business operator.
            </p>
          </section>

          <section>
            <h2 className="text-base font-serif font-bold text-ivory-100 mb-2">4. Official Grievances</h2>
            <p>
              LabelMitra assists users by preparing structured complaint drafts with extracted evidence. All formal grievances must be reviewed and submitted manually by the user to the designated official portal (FSSAI Food Safety Connect).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
