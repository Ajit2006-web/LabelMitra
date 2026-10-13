import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  Scale,
  ArrowRight,
  CheckCircle2,
  FileWarning,
  Sparkles,
  BookOpen,
  Wheat,
  Activity,
  Layers,
  ScanLine,
  User
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-forest-900 border border-gold-500/35 rounded-button text-xs font-medium text-gold-400">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
              <span className="tracking-wide">Official FSSAI Compliance & Explainable Food Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-ivory-100 tracking-tight leading-[1.12]">
              Food Labels <br />
              <span className="text-gold-500 italic font-normal">Made Clear.</span>
            </h1>

            <p className="text-base sm:text-lg text-sage-300 leading-relaxed max-w-xl">
              An intelligent, evidence-based food label analysis platform for Indian packaged foods. We audit statutory declarations against official FSSAI regulations, cross-reference ingredients with your personalized allergy profile, and deliver transparent, explainable recommendations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/scan"
                    className="btn-gold text-sm px-6 py-3.5 flex items-center gap-2 font-semibold"
                  >
                    <ScanLine className="w-4 h-4 text-forest-950" />
                    <span>Scan a Food Label</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="btn-secondary-forest text-sm px-6 py-3.5 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-gold-500" />
                    <span>Your Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-gold text-sm px-6 py-3.5 flex items-center gap-2 font-semibold"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#pipeline"
                    className="btn-secondary-forest text-sm px-6 py-3.5"
                  >
                    <span>Learn More</span>
                  </a>
                </>
              )}
            </div>

            {/* Verification Stats Micro-Bar */}
            <div className="pt-6 border-t border-forest-700/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-gold-500">100%</p>
                <p className="text-xs text-sage-400 mt-0.5">Deterministic Rules</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-ivory-100">10+</p>
                <p className="text-xs text-sage-400 mt-0.5">FSSAI Allergens</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-ivory-100">Zero</p>
                <p className="text-xs text-sage-400 mt-0.5">Hallucinations</p>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Food Imagery & Intelligence Card Showcase */}
          <div className="lg:col-span-5 relative">
            {/* Ambient gold glow */}
            <div className="absolute -inset-1 bg-gold-500/10 rounded-card blur-xl pointer-events-none"></div>

            <div className="relative space-y-4">
              {/* Featured Food Imagery Card */}
              <div className="bg-forest-900 border border-gold-500/35 rounded-card p-4 shadow-xl overflow-hidden">
                <div className="relative h-56 rounded-md overflow-hidden bg-forest-950">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80"
                    alt="Wholesome ingredients, grains, and nuts"
                    className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-forest-900/90 text-gold-400 border border-gold-500/30 rounded font-medium">
                      Curated Food Knowledge Base
                    </span>
                    <span className="text-sage-300 font-mono text-[11px] bg-forest-950/80 px-2 py-0.5 rounded">
                      FSSAI 2020 Standard
                    </span>
                  </div>
                </div>

                {/* Micro Analysis Extract Card */}
                <div className="mt-4 p-4 bg-forest-850 border border-forest-700/80 rounded-md">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-forest-700/60">
                    <span className="font-semibold text-ivory-100 flex items-center gap-1.5">
                      <Wheat className="w-3.5 h-3.5 text-gold-500" />
                      Extracted Ingredient Analysis
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">OCR Verified</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-sage-300">
                      <span>Groundnut (Peanut)</span>
                      <span className="text-rose-300 font-medium px-2 py-0.5 bg-rose-950/60 border border-rose-900/60 rounded text-[11px]">
                        Allergen Flagged
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sage-300">
                      <span>Added Sugars</span>
                      <span className="text-amber-300 font-medium px-2 py-0.5 bg-amber-950/60 border border-amber-900/60 rounded text-[11px]">
                        High (&gt;22g/100g)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sage-300">
                      <span>FSSAI Lic. 14 Digits</span>
                      <span className="text-emerald-300 font-medium px-2 py-0.5 bg-emerald-950/60 border border-emerald-900/60 rounded text-[11px]">
                        Pass (RULE-002)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pipeline Section */}
      <section id="pipeline" className="bg-forest-900/60 border-y border-forest-700/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-gold-500">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-100 tracking-tight">
              Evidence-Based Verification Pipeline
            </h2>
            <p className="text-sm text-sage-400 leading-relaxed">
              Unlike generic generative AI models, LabelMitra strictly separates deterministic statutory rules from explanatory natural language.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-forest space-y-3 hover:border-gold-500/40 transition-colors">
              <div className="w-10 h-10 rounded-button bg-forest-800 border border-forest-700 flex items-center justify-center text-gold-500 mb-2">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-ivory-100">1. Modular OCR & Extraction</h3>
              <p className="text-xs text-sage-400 leading-relaxed">
                Captures package images across front, back, and nutrition panels. PaddleOCR extracts text, bounding boxes, and confidence metrics without hallucination.
              </p>
            </div>

            <div className="card-forest space-y-3 hover:border-gold-500/40 transition-colors">
              <div className="w-10 h-10 rounded-button bg-forest-800 border border-forest-700 flex items-center justify-center text-gold-500 mb-2">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-ivory-100">2. Rule Compliance Engine</h3>
              <p className="text-xs text-sage-400 leading-relaxed">
                Evaluates statutory FSSAI rules (license format, mandatory declarations, veg/non-veg logos) deterministically against codified regulations.
              </p>
            </div>

            <div className="card-forest space-y-3 hover:border-gold-500/40 transition-colors">
              <div className="w-10 h-10 rounded-button bg-forest-800 border border-forest-700 flex items-center justify-center text-rose-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-ivory-100">3. Allergen Matching</h3>
              <p className="text-xs text-sage-400 leading-relaxed">
                Cross-references package ingredients with user allergies using synonym resolution (e.g. groundnut to peanut) and checks advisory statements.
              </p>
            </div>

            <div className="card-forest space-y-3 hover:border-gold-500/40 transition-colors">
              <div className="w-10 h-10 rounded-button bg-forest-800 border border-forest-700 flex items-center justify-center text-gold-500 mb-2">
                <FileWarning className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-ivory-100">4. Grievance Assistance</h3>
              <p className="text-xs text-sage-400 leading-relaxed">
                When compliance discrepancies are identified, drafts structured grievances with extracted evidence for submission via official FSSAI Food Safety Connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Light Editorial Contrast Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="panel-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-gold-800">
                Scientific & Legal Transparency
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-900 tracking-tight">
                Explainable AI With Zero Hallucination of Regulations
              </h2>
              <p className="text-sm text-ivory-800 leading-relaxed">
                Every finding generated by LabelMitra links directly to the extracted packaging snippet and the underlying statutory clause in FSSAI regulations. We never fabricate health claims, accuse manufacturers automatically, or issue legal certifications.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-2.5 text-xs text-ivory-900 font-medium">
              <div className="flex items-center gap-2 p-2.5 bg-ivory-50/70 rounded border border-gold-600/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Auditable FSSAI rule references</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-ivory-50/70 rounded border border-gold-600/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Synonym-aware ingredient taxonomy</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-ivory-50/70 rounded border border-gold-600/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Indian dietary benchmarks (ICMR/NIN)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-ivory-50/70 rounded border border-gold-600/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Traceable alternative recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
