import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture, panelTitle }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    setCapturedPhoto(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please verify camera permissions or upload an image file.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedPhoto({ file, previewUrl });
      }
    }, 'image/jpeg', 0.92);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto.file, capturedPhoto.previewUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-forest-900 border border-forest-700 rounded-card shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-forest-700/80">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-gold-500" />
            <h3 className="text-sm font-serif font-bold text-ivory-100">
              Capture {panelTitle || 'Package Panel'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-sage-400 hover:text-ivory-100 p-1 rounded hover:bg-forest-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Snapshot Area */}
        <div className="relative aspect-video bg-forest-950 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-xs text-rose-300">
              <p>{cameraError}</p>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto.previewUrl}
              alt="Captured packaging"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Guide Alignment Frame */}
          {!capturedPhoto && !cameraError && (
            <div className="absolute inset-6 border-2 border-dashed border-gold-500/50 rounded pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-mono text-gold-400/80 bg-forest-950/80 px-2 py-0.5 rounded">
                Align label text within frame
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-forest-700/80 flex items-center justify-end gap-2.5">
          {capturedPhoto ? (
            <>
              <button
                onClick={startCamera}
                className="btn-secondary-forest text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                onClick={handleConfirm}
                className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-forest-950" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <button
              onClick={captureFrame}
              disabled={!!cameraError}
              className="btn-gold text-xs py-2 px-5 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-forest-950" />
              <span>Capture Image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
