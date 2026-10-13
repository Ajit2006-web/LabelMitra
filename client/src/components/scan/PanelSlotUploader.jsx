import React, { useState } from 'react';
import { Upload, Camera, X, Image as ImageIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import CameraModal from './CameraModal';

const PANELS = [
  {
    id: 'front',
    title: 'Front Panel',
    subtitle: 'Brand, Product Name, Veg/Non-Veg Logo & Net Quantity',
    required: true,
  },
  {
    id: 'nutrition',
    title: 'Nutrition Table',
    subtitle: 'Per 100g/serving table (Energy, Sugar, Fat, Sodium)',
    required: false,
  },
  {
    id: 'ingredients',
    title: 'Ingredients Panel',
    subtitle: 'Full ingredient list & allergen advisory statements',
    required: false,
  },
  {
    id: 'side',
    title: 'Statutory Declarations',
    subtitle: '14-Digit FSSAI License, Batch No., Mfg & Expiry dates',
    required: false,
  },
];

export default function PanelSlotUploader({ slots, onUpdateSlot }) {
  const [activeCameraSlot, setActiveCameraSlot] = useState(null);

  const handleFileChange = (panelId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onUpdateSlot(panelId, { file, previewUrl });
    }
  };

  const handleRemove = (panelId) => {
    onUpdateSlot(panelId, null);
  };

  const handleCameraCapture = (file, previewUrl) => {
    if (activeCameraSlot) {
      onUpdateSlot(activeCameraSlot, { file, previewUrl });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PANELS.map((panel) => {
          const slotData = slots[panel.id];
          const hasImage = !!slotData?.file;

          return (
            <div
              key={panel.id}
              className={`p-4 rounded-card border transition-all ${
                hasImage
                  ? 'bg-forest-850 border-gold-500/50 shadow-sm'
                  : 'bg-forest-900 border-forest-700/80 hover:border-forest-600'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-ivory-100">{panel.title}</h4>
                    {panel.required ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gold-500/20 text-gold-400 border border-gold-500/40 rounded">
                        Recommended
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-sage-500">Optional</span>
                    )}
                  </div>
                  <p className="text-[11px] text-sage-400 mt-0.5 leading-normal">{panel.subtitle}</p>
                </div>

                {hasImage && (
                  <button
                    onClick={() => handleRemove(panel.id)}
                    className="text-sage-400 hover:text-rose-400 p-1 rounded hover:bg-forest-800 transition-colors"
                    title="Remove this panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Slot Body: Empty Upload Zone or Image Preview */}
              {hasImage ? (
                <div className="relative aspect-video rounded-md overflow-hidden bg-forest-950 border border-forest-700/60 group">
                  <img
                    src={slotData.previewUrl}
                    alt={panel.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-forest-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleRemove(panel.id)}
                      className="btn-danger-forest text-xs py-1.5 px-3"
                    >
                      Change Photo
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-forest-900/90 text-gold-400 px-2 py-0.5 rounded text-[11px] border border-gold-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Ready for OCR</span>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-forest-700 rounded-md p-4 text-center hover:border-gold-500/40 transition-colors bg-forest-950/40">
                  <ImageIcon className="w-6 h-6 text-sage-500 mx-auto mb-2" />
                  <p className="text-xs text-sage-300 font-medium">Drag photo here or select an option</p>
                  <p className="text-[10px] text-sage-500 mt-0.5 mb-3">JPG, PNG, WebP up to 10MB</p>

                  <div className="flex items-center justify-center gap-2">
                    <label className="btn-secondary-forest text-xs py-1.5 px-3 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-gold-500" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(panel.id, e)}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setActiveCameraSlot(panel.id)}
                      className="btn-secondary-forest text-xs py-1.5 px-3"
                    >
                      <Camera className="w-3.5 h-3.5 text-gold-500" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* WebRTC Camera Modal */}
      <CameraModal
        isOpen={!!activeCameraSlot}
        onClose={() => setActiveCameraSlot(null)}
        onCapture={handleCameraCapture}
        panelTitle={PANELS.find((p) => p.id === activeCameraSlot)?.title}
      />
    </div>
  );
}
