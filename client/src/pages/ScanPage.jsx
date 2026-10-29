import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PanelSlotUploader from '../components/scan/PanelSlotUploader';
import OCRConfidenceGauge from '../components/scan/OCRConfidenceGauge';
import StructuredExtractionView from '../components/scan/StructuredExtractionView';
import PersonalizedAllergyView from '../components/scan/PersonalizedAllergyView';
import {
  Loader2,
  ScanLine,
  LogIn,
  User,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const ENGINE_BADGE = {
  paddleocr: { label: 'PaddleOCR', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800' },
  easyocr: { label: 'EasyOCR', color: 'text-sky-300 bg-sky-950/60 border-sky-800' },
  'service-offline': { label: 'AI Service Offline', color: 'text-rose-300 bg-rose-950/60 border-rose-800' },
  'nativeocr-adapter': { label: 'Test Adapter', color: 'text-amber-300 bg-amber-950/60 border-amber-800' },
  fallback: { label: 'Fallback Parser', color: 'text-amber-300 bg-amber-950/60 border-amber-800' },
};

export default function ScanPage() {
  const { token, isAuthenticated, loading } = useAuth();

  const [slots, setSlots] = useState({});
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const updateSlot = (panelId, data) => {
    setSlots((prev) => ({ ...prev, [panelId]: data }));
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const files = Object.entries(slots)
      .filter(([, v]) => v && v.file)
      .map(([key, v]) => ({ field: key, file: v.file }));

    if (files.length === 0) {
      setErrorMsg('Please upload at least one panel image before scanning.');
      return;
    }

    const formData = new FormData();
    files.forEach(({ field, file }) => formData.append(field, file));

    setScanning(true);
    setResult(null);
    try {
      const res = await fetch('/api/scans/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setResult(data.data);
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.getElementById('scan-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setSlots({});
    setResult(null);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const panelCount = Object.values(slots).filter((v) => v && v.file).length;

  // Loading auth state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  // Not authenticated — prompt login
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-card bg-forest-900 border border-gold-500/30 flex items-center justify-center text-gold-500">
          <ScanLine className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-ivory-100">Sign In to Scan</h1>
        <p className="text-sage-400 text-sm leading-relaxed">
          You need a LabelMitra account to analyse food labels. Your scan history and
          allergen profile are saved securely to your account.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/login?redirect=/scan" className="btn-gold text-sm px-6 py-2.5 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-forest-950" />
            <span>Sign In</span>
          </Link>
          <Link to="/register" className="btn-secondary-forest text-sm px-6 py-2.5">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-forest-700/80 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-widest text-gold-500">
            Image Upload &amp; OCR Pipeline
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ivory-100 mt-1">
            Scan a Food Label
          </h1>
          <p className="text-xs sm:text-sm text-sage-400 mt-1.5 max-w-xl">
            Upload photos of each packaging panel. LabelMitra preprocesses each image and
            extracts all text using the OCR engine for downstream analysis.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/profile"
            className="btn-secondary-forest text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-gold-500" />
            <span>Your Profile</span>
          </Link>
          {result && (
            <button
              onClick={handleReset}
              className="btn-secondary-forest text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel Uploader — hidden once results arrive */}
      {!result && (
        <section className="space-y-6">
          <PanelSlotUploader slots={slots} onUpdateSlot={updateSlot} />

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleSubmit}
              disabled={scanning || panelCount === 0}
              className="btn-gold text-sm px-7 py-3 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing OCR…</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4 text-forest-950" />
                  <span>Run OCR Scan</span>
                </>
              )}
            </button>

            {panelCount > 0 && !scanning && (
              <p className="text-xs text-sage-400">
                {panelCount} panel{panelCount > 1 ? 's' : ''} ready &middot; Click to extract text
              </p>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-rose-300 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Info tip */}
          <div className="flex items-start gap-3 p-4 bg-forest-900/60 border border-forest-700/60 rounded-card text-xs text-sage-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
            <p>
              For best results upload <strong className="text-ivory-100">all four panels</strong>:
              Front, Nutrition Table, Ingredients List, and Statutory Declarations side.
              The Front panel is the minimum requirement.
            </p>
          </div>
        </section>
      )}

      {/* OCR Results */}
      {result && (
        <section id="scan-results" className="space-y-8">
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gold-500">OCR Extraction Results</h2>
              <p className="text-xs text-sage-400 mt-1 font-mono">
                Scan&nbsp;ID:&nbsp;{result.scan?.id}&nbsp;&middot;&nbsp;
                <span
                  className={
                    result.status === 'COMPLETED' ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'
                  }
                >
                  {result.status}
                </span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary-forest text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Another Label</span>
            </button>
          </div>

          {/* Composite Confidence Gauge */}
          <OCRConfidenceGauge confidence={result.compositeConfidence} />

          {/* Status callout */}
          {result.status === 'NEEDS_VERIFICATION' ? (
            <div className="flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-800/60 rounded-card text-xs text-amber-200 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p>
                <strong>Low confidence detected.</strong> Some panels may have poor image quality
                or blurred text. Review the extracted text below and re-upload clearer images if
                needed before proceeding to compliance checks.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-card text-xs text-emerald-200 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p>
                <strong>Extraction complete.</strong> All panels have been processed with sufficient
                confidence. The extracted text will be used in subsequent compliance and allergen
                analysis modules.
              </p>
            </div>
          )}

          {/* Phase 4: Personalized Allergy Matching */}
          {result.scan?.extractedData?.personalized_allergy_assessment && (
            <PersonalizedAllergyView
              assessment={result.scan.extractedData.personalized_allergy_assessment}
            />
          )}

          {/* Phase 3: Structured Product Information View */}
          {result.scan?.extractedData && (
            <StructuredExtractionView extractedData={result.scan.extractedData} />
          )}

          {/* Per-panel cards */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sage-400 mb-4">
              Panel-by-Panel Extraction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.ocrResults.map((r) => {
                const engineKey = (r.engineUsed || '').toLowerCase();
                const badge = ENGINE_BADGE[engineKey] || {
                  label: r.engineUsed || 'Unknown',
                  color: 'text-sage-300 bg-forest-850 border-forest-700',
                };
                const conf = Math.round(Number(r.confidenceScore || 0));
                const confColor =
                  conf >= 80 ? 'text-emerald-300' : conf >= 60 ? 'text-amber-300' : 'text-rose-300';

                return (
                  <div
                    key={r.id}
                    className="card-forest space-y-3 hover:border-gold-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-forest-700/60">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gold-500" />
                        <h4 className="text-sm font-serif font-bold text-ivory-100">
                          {r.imageSide} Panel
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <span className={`text-sm font-bold font-mono ${confColor}`}>
                          {conf}%
                        </span>
                      </div>
                    </div>

                    {/* Mini confidence bar */}
                    <div className="w-full bg-forest-950 rounded-full h-1.5 overflow-hidden border border-forest-700/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          conf >= 80 ? 'bg-emerald-500' : conf >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${conf}%` }}
                      />
                    </div>

                    {/* Extracted text */}
                    {r.rawText ? (
                      <div className="bg-forest-950 border border-forest-700/40 rounded-md p-3 max-h-44 overflow-y-auto">
                        <pre className="text-[11px] text-sage-300 whitespace-pre-wrap break-words leading-relaxed font-mono">
                          {r.rawText}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-xs text-sage-500 italic">No text extracted from this panel.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next-step card */}
          <div className="card-forest-gold space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
              <h3 className="text-base font-serif font-bold text-ivory-100">What Comes Next?</h3>
            </div>
            <p className="text-xs text-sage-400 leading-relaxed">
              OCR extraction is Phase 2. Upcoming modules will parse this text into structured
              data, run <strong className="text-ivory-100">FSSAI statutory compliance checks</strong>,
              and match ingredients against your{' '}
              <strong className="text-ivory-100">personalised allergen profile</strong>.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/profile"
                className="btn-secondary-forest text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-gold-500" />
                <span>Review Allergy Profile</span>
              </Link>
              <button
                onClick={handleReset}
                className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <ScanLine className="w-3.5 h-3.5 text-forest-950" />
                <span>Scan Another Label</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
