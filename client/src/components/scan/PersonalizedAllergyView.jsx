import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  User,
  HeartPulse,
} from 'lucide-react';

export default function PersonalizedAllergyView({ assessment }) {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!assessment) return null;

  const {
    status = 'NO_USER_ALLERGIES',
    headline = 'Allergy Assessment',
    summary = '',
    matches = [],
    hasPrecautionaryAlert = false,
    disclaimer = '',
  } = assessment;

  // Determine banner color styling based on assessment status
  let bannerTheme = {
    cardBorder: 'border-forest-700/60',
    cardBg: 'bg-forest-900/40',
    iconColor: 'text-gold-500',
    badgeBg: 'bg-forest-800 border-forest-600 text-sage-300',
    Icon: Info,
  };

  if (status === 'CONFIRMED_MATCH') {
    bannerTheme = {
      cardBorder: 'border-rose-600/80',
      cardBg: 'bg-rose-950/40',
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-950/80 border-rose-700 text-rose-200',
      Icon: ShieldAlert,
    };
  } else if (status === 'POSSIBLE_MATCH') {
    bannerTheme = {
      cardBorder: 'border-amber-600/80',
      cardBg: 'bg-amber-950/40',
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 border-amber-700 text-amber-200',
      Icon: AlertTriangle,
    };
  } else if (status === 'NO_MATCH_DETECTED') {
    bannerTheme = {
      cardBorder: 'border-emerald-600/80',
      cardBg: 'bg-emerald-950/40',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 border-emerald-700 text-emerald-200',
      Icon: ShieldCheck,
    };
  } else if (status === 'UNKNOWN_INSUFFICIENT_DATA') {
    bannerTheme = {
      cardBorder: 'border-amber-700/60',
      cardBg: 'bg-amber-950/30',
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-900/60 border-amber-700 text-amber-200',
      Icon: AlertTriangle,
    };
  }

  const { Icon } = bannerTheme;

  return (
    <div
      data-testid="personalized-allergy-view"
      className={`rounded-card border ${bannerTheme.cardBorder} ${bannerTheme.cardBg} p-5 space-y-4`}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-forest-950/60 border border-forest-800 shrink-0">
            <Icon className={`w-6 h-6 ${bannerTheme.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-serif font-bold text-ivory-100">{headline}</h3>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${bannerTheme.badgeBg}`}>
                {status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-sage-300 mt-1 leading-relaxed max-w-2xl">{summary}</p>
          </div>
        </div>

        {matches.length > 0 && (
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="btn-secondary-forest text-xs py-1.5 px-3 flex items-center gap-1.5 self-start shrink-0"
            title="Toggle OCR evidence"
          >
            <Info className="w-3.5 h-3.5 text-gold-500" />
            <span>{showEvidence ? 'Hide Evidence' : 'View Evidence'}</span>
            {showEvidence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* When user has no configured allergies in profile */}
      {status === 'NO_USER_ALLERGIES' && (
        <div className="p-3 bg-forest-950/50 rounded-md border border-forest-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sage-400">
          <p>
            Add allergens (such as Peanut, Milk, Wheat, Tree nuts) in your profile to enable
            tailored cross-matching on every scan.
          </p>
          <Link
            to="/profile"
            className="btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <User className="w-3 h-3 text-forest-950" />
            <span>Set Up Allergies</span>
          </Link>
        </div>
      )}

      {/* Matched Allergens List */}
      {matches.length > 0 && (
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-sage-400 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-gold-500" />
            <span>Detected Allergen Matches ({matches.length})</span>
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {matches.map((m, idx) => {
              const isConfirmed = m.matchType === 'CONFIRMED_MATCH';
              const severity = m.userAllergy?.severity || 'Moderate';
              const sevBadge =
                severity.toLowerCase() === 'severe'
                  ? 'bg-rose-900/60 text-rose-300 border-rose-700'
                  : severity.toLowerCase() === 'moderate'
                  ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                  : 'bg-forest-800 text-sage-300 border-forest-600';

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-forest-950/70 border border-forest-700/60 rounded-md space-y-2 hover:border-gold-500/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-ivory-100">
                        {m.matchedEntity}
                      </span>
                      {m.canonicalName && m.canonicalName !== m.matchedEntity && (
                        <span className="text-[11px] text-sage-400 font-mono">
                          (Canonical: {m.canonicalName})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sevBadge}`}>
                        {severity} Allergy
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                          isConfirmed
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {m.source.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Explainable reasoning */}
                  <p className="text-xs text-ivory-200 leading-relaxed font-sans">{m.reason}</p>

                  {/* Provenance & evidence block */}
                  {showEvidence && (
                    <div className="mt-2 pt-2 border-t border-forest-800/80 text-[11px] space-y-1 font-mono text-sage-400 bg-forest-900/40 p-2.5 rounded">
                      <div className="flex items-center justify-between">
                        <span>Source Panel: <strong className="text-ivory-100">{m.sourcePanel}</strong></span>
                        <span>Confidence: <strong className="text-emerald-400">{Math.round(m.confidence * 100)}%</strong></span>
                      </div>
                      {m.evidenceText && (
                        <div className="pt-1 text-sage-300 italic whitespace-pre-wrap break-words">
                          &ldquo;{m.evidenceText}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mandatory Statutory Non-Medical Disclaimer */}
      {disclaimer && (
        <div className="pt-2 border-t border-forest-800/70 flex items-start gap-2 text-[11px] text-sage-400 leading-relaxed">
          <Info className="w-3.5 h-3.5 text-gold-500 mt-0.5 shrink-0" />
          <p>{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
