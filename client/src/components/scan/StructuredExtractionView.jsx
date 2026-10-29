import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Calendar,
  DollarSign,
  Tag,
  Factory,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

export default function StructuredExtractionView({ extractedData }) {
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  if (!extractedData || !extractedData.product_identity) {
    return null;
  }

  const identity = extractedData.product_identity || {};
  const statutory = extractedData.statutory_declarations || {};
  const ingredients = extractedData.ingredients || {};
  const allergens = extractedData.allergens || {};
  const nutrition = extractedData.nutrition || {};
  const nutrients = nutrition.nutrients || {};
  const summary = extractedData.extraction_summary || {};
  const manufacturer = extractedData.manufacturer || {};

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-forest-700/70">
        <div className="flex items-center gap-2.5">
          <FileCheck2 className="w-6 h-6 text-gold-500" />
          <div>
            <h3 className="text-xl font-serif font-bold text-ivory-100">
              Structured Product Information
            </h3>
            <p className="text-xs text-sage-400">
              Verified packaging facts extracted deterministically from multi-panel OCR text.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded border bg-emerald-950/60 border-emerald-800 text-emerald-300">
            {summary.fields_extracted || 0} Fields Extracted
          </span>
          <button
            onClick={() => setShowRawEvidence(!showRawEvidence)}
            className="btn-secondary-forest text-xs py-1 px-2.5 flex items-center gap-1.5"
            title="Toggle OCR evidence text"
          >
            <Info className="w-3.5 h-3.5 text-gold-500" />
            <span>{showRawEvidence ? 'Hide Evidence' : 'Show Evidence'}</span>
          </button>
        </div>
      </div>

      {/* Banner if no food label was detected */}
      {summary.fields_extracted === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-800/60 rounded-card text-xs text-amber-200 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <strong className="block text-sm font-semibold text-amber-300">No Food Label Detected</strong>
            <p className="mt-0.5 text-sage-300">
              LabelMitra could not detect food product information or packaging declarations in the uploaded image. Please ensure you upload clear photos of an actual food label (e.g. front panel with brand name, ingredients list, or nutrition table).
            </p>
          </div>
        </div>
      )}

      {/* Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Product Identity & Statutory Cards */}
        <div className="space-y-6">
          {/* Card 1: Product Identity */}
          <div className="bg-forest-850 border border-forest-700/80 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-700/60">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-500" />
                <h4 className="text-sm font-serif font-bold text-ivory-100">Product Identity</h4>
              </div>
              {identity.veg_status?.value === 'VEG' ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-700/70 bg-emerald-950/50 text-emerald-300 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>100% Vegetarian</span>
                </div>
              ) : identity.veg_status?.value === 'NON_VEG' ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-rose-800/70 bg-rose-950/50 text-rose-300 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                  <span>Non-Vegetarian</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sage-500 block">Brand</span>
                <p className="text-sm font-semibold text-ivory-100">{identity.brand?.value || 'Brand not detected'}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sage-500 block">Product Name</span>
                <p className="text-base font-serif font-bold text-gold-400">{identity.product_name?.value || 'Product name not detected'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sage-500 block">Category</span>
                  <p className="text-xs text-sage-300 font-medium">{identity.category?.value || 'Packaged Food'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sage-500 block">Net Quantity</span>
                  <p className="text-xs font-mono font-semibold text-ivory-100">
                    {statutory.net_quantity?.value ? `${statutory.net_quantity.value} ${statutory.net_quantity.unit}` : 'Not declared'}
                  </p>
                </div>
              </div>
            </div>

            {showRawEvidence && identity.product_name?.evidence_text && (
              <div className="bg-forest-950/80 p-2.5 rounded border border-forest-700/50 text-[11px] font-mono text-sage-400 space-y-1">
                <span className="text-[10px] text-gold-500 uppercase font-semibold">OCR Evidence ({identity.product_name.source_panel}):</span>
                <p className="text-sage-300 break-words">{identity.product_name.evidence_text}</p>
              </div>
            )}
          </div>

          {/* Card 2: Statutory Compliance Declarations */}
          <div className="bg-forest-850 border border-forest-700/80 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-forest-700/60">
              <ShieldCheck className="w-4 h-4 text-gold-500" />
              <h4 className="text-sm font-serif font-bold text-ivory-100">FSSAI Statutory Declarations</h4>
            </div>

            <div className="space-y-3.5">
              {/* FSSAI License */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sage-500 block">14-Digit FSSAI License</span>
                  <p className="text-sm font-mono font-bold text-ivory-100 tracking-wider">
                    {statutory.fssai_license?.value || 'Not Detected'}
                  </p>
                </div>
                {statutory.fssai_license?.value ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                    PASS · Valid Format
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 border border-amber-800 text-amber-300">
                    Missing on Label
                  </span>
                )}
              </div>

              {/* Grid: MRP, Batch, Dates */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-forest-700/40">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sage-500 block">MRP</span>
                  <p className="text-xs font-mono font-semibold text-gold-400">
                    {statutory.mrp?.value ? `Rs. ${Number(statutory.mrp.value).toFixed(2)}` : 'Not Detected'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-sage-500 block">Batch / Lot No.</span>
                  <p className="text-xs font-mono text-ivory-100">{statutory.batch_number?.value || 'Not Detected'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-sage-500 block">Mfg / Pkd Date</span>
                  <p className="text-xs font-mono text-sage-300">{statutory.date_of_manufacture?.raw_text || 'Not Detected'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-sage-500 block">Best Before</span>
                  <p className="text-xs text-sage-300 font-medium">{statutory.best_before?.value || 'Not Detected'}</p>
                </div>
              </div>

              {/* Manufacturer */}
              {manufacturer.name?.value && (
                <div className="pt-2 border-t border-forest-700/40">
                  <span className="text-[10px] font-mono uppercase text-sage-500 block">Manufacturer</span>
                  <p className="text-xs text-sage-300 font-medium">{manufacturer.name.value}</p>
                  {manufacturer.address?.value && (
                    <p className="text-[11px] text-sage-500 mt-0.5">{manufacturer.address.value}</p>
                  )}
                </div>
              )}
            </div>

            {showRawEvidence && statutory.fssai_license?.evidence_text && (
              <div className="bg-forest-950/80 p-2.5 rounded border border-forest-700/50 text-[11px] font-mono text-sage-400 space-y-1">
                <span className="text-[10px] text-gold-500 uppercase font-semibold">OCR Evidence ({statutory.fssai_license.source_panel}):</span>
                <p className="text-sage-300 break-words">{statutory.fssai_license.evidence_text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ingredients, INS Additives, Nutrition & Allergens */}
        <div className="space-y-6">
          {/* Card 3: Ingredients & Food Additives */}
          <div className="bg-forest-850 border border-forest-700/80 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-700/60">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-500" />
                <h4 className="text-sm font-serif font-bold text-ivory-100">Ingredients &amp; INS Additives</h4>
              </div>
              <span className="text-[11px] font-mono text-sage-400">
                {ingredients.items?.length || 0} items identified
              </span>
            </div>

            {/* Tokenized item badges */}
            {ingredients.items && ingredients.items.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {ingredients.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-forest-900 border border-forest-700 text-ivory-100 font-medium"
                  >
                    <span>{item.name}</span>
                    {item.percentage && (
                      <span className="text-[10px] font-mono text-gold-400 font-bold">
                        ({item.percentage}%)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sage-500 italic">No ingredient list detected on packaging.</p>
            )}

            {/* Statutory INS Additives List */}
            {ingredients.detected_ins_additives && ingredients.detected_ins_additives.length > 0 && (
              <div className="pt-3 border-t border-forest-700/50 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-semibold block">
                  Detected INS Additives
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ingredients.detected_ins_additives.map((ins, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-forest-950/70 border border-forest-700/60 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gold-400">{ins.ins_code}</span>
                        <span className="text-[10px] text-sage-500">{ins.functional_class}</span>
                      </div>
                      <p className="text-sage-300 mt-0.5 truncate">{ins.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergen declaration statement */}
            {allergens.mandatory_declaration?.value && (
              <div className="pt-3 border-t border-forest-700/50 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold block">
                  Allergen Advisory
                </span>
                <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200">
                  <p className="leading-relaxed">{allergens.mandatory_declaration.value}</p>
                  {allergens.contains && allergens.contains.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-[11px]">
                      <span className="font-semibold text-rose-300">Contains:</span>
                      <span className="text-ivory-100">{allergens.contains.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Nutrition Information Table */}
          <div className="bg-forest-850 border border-forest-700/80 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest-700/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <h4 className="text-sm font-serif font-bold text-ivory-100">Nutrition Facts Table</h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-forest-700 bg-forest-900 text-gold-400">
                Basis: {nutrition.reference_unit || 'Per 100g'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-forest-700/80 text-[10px] uppercase font-mono text-sage-500">
                    <th className="py-2 font-semibold">Nutrient</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                    <th className="py-2 text-right font-semibold">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-800/60 font-mono">
                  {Object.entries({
                    'Energy': nutrients.energy,
                    'Protein': nutrients.protein,
                    'Carbohydrate': nutrients.carbohydrate,
                    'Total Sugars': nutrients.total_sugar,
                    'Added Sugars': nutrients.added_sugar,
                    'Total Fat': nutrients.fat,
                    'Saturated Fat': nutrients.saturated_fat,
                    'Trans Fat': nutrients.trans_fat,
                    'Sodium': nutrients.sodium,
                    'Dietary Fiber': nutrients.dietary_fiber,
                  }).map(([label, n], idx) => {
                    const hasVal = n && n.value !== null && n.value !== undefined;
                    return (
                      <tr key={idx} className="hover:bg-forest-900/40 transition-colors">
                        <td className="py-2 text-sage-300 font-sans">{label}</td>
                        <td className="py-2 text-right font-bold text-ivory-100">
                          {hasVal ? n.value : <span className="text-sage-600 font-normal">--</span>}
                        </td>
                        <td className="py-2 text-right text-sage-500">
                          {hasVal ? n.unit : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
