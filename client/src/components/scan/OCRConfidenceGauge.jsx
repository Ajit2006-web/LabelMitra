import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export default function OCRConfidenceGauge({ confidence }) {
  const score = Math.max(0, Math.min(100, Math.round(Number(confidence || 0))));

  let statusColor = 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
  let statusText = 'Optimal Clarity';
  let gaugeBarColor = 'bg-emerald-500';

  if (score < 60) {
    statusColor = 'text-rose-300 border-rose-800 bg-rose-950/60';
    statusText = 'Needs Verification';
    gaugeBarColor = 'bg-rose-500';
  } else if (score < 80) {
    statusColor = 'text-amber-300 border-amber-800 bg-amber-950/60';
    statusText = 'Moderate Clarity';
    gaugeBarColor = 'bg-amber-500';
  }

  return (
    <div className="p-4 bg-forest-900 border border-forest-700/80 rounded-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-300">
            OCR Extraction Confidence
          </span>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusColor}`}>
          {statusText}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-serif font-bold text-ivory-100">{score}%</span>
        <span className="text-xs text-sage-400 font-mono">Character Detection Average</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-forest-950 rounded-full h-2 overflow-hidden border border-forest-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${gaugeBarColor}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <p className="text-[11px] text-sage-400 leading-normal">
        {score >= 80 ? (
          'All packaging lines and numerical declarations extracted with high fidelity.'
        ) : score >= 60 ? (
          'Text readable. Some small print or curved characters may require human confirmation.'
        ) : (
          'Low confidence extraction. Inspect extracted lines before continuing to compliance check.'
        )}
      </p>
    </div>
  );
}
