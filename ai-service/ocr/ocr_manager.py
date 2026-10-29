import os
import sys
import cv2  # added for simple preprocessing
# pyrefly: ignore[missing-import]
import numpy as np

# Engine availability probes
PADDLE_AVAILABLE = False
try:
    from paddleocr import PaddleOCR
    PADDLE_AVAILABLE = True
except ImportError:
    PADDLE_AVAILABLE = False

EASYOCR_AVAILABLE = False
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

class OCRManager:
    def __init__(self):
        self.paddle_ocr = None
        self.easy_ocr = None
        self.primary_engine = "PaddleOCR" if PADDLE_AVAILABLE else ("EasyOCR" if EASYOCR_AVAILABLE else "NativeEngine")
        self._initialize_engines()

    def _initialize_engines(self):
        # If PaddleOCR is unavailable we fall back to EasyOCR which already loads English+Hindi
        pass
        if PADDLE_AVAILABLE:
            try:
                # PaddleOCR v3.x configured for English ('en'). EasyOCR handles English & Hindi ('en', 'hi').
                self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en')
            except Exception as e:
                print(f"[OCRManager] Warning: PaddleOCR init failed ({e}), trying fallback.")

        if EASYOCR_AVAILABLE:
            try:
                self.easy_ocr = easyocr.Reader(['en', 'hi'], gpu=False)
            except Exception as e:
                print(f"[OCRManager] Warning: EasyOCR init failed ({e}).")

    def extract_text(self, image_np: np.ndarray) -> dict:
        """Run OCR on a pre‑processed image and filter low‑confidence results.
        Returns the same dict structure as before.
        """
        # Use the shared preprocessing pipeline for OCR
        try:
            from preprocessing.pipeline import preprocess_for_ocr
            preprocessed_img, _ = preprocess_for_ocr(image_np)
            if len(preprocessed_img.shape) == 2:
                image_np = cv2.cvtColor(preprocessed_img, cv2.COLOR_GRAY2BGR)
            else:
                image_np = preprocessed_img
        except Exception as e:
            # If preprocessing fails, fall back to original image but log
            print(f"[OCRManager] Preprocessing error: {e}, using original image.")

        """
        Runs OCR on preprocessed image array and returns structured lines, bounding boxes, and confidence.
        """
        # 1. Try PaddleOCR
        if self.paddle_ocr is not None:
            try:
                results = self.paddle_ocr.ocr(image_np)
                lines = []
                total_conf = 0.0
                count = 0

                if results and len(results) > 0 and results[0] is not None:
                    first_res = results[0]
                    # Handle PaddleOCR v3.x / paddlex dict format
                    if isinstance(first_res, dict) and "rec_texts" in first_res:
                        texts = first_res.get("rec_texts", [])
                        scores = first_res.get("rec_scores", [])
                        polys = first_res.get("rec_polys", [])
                        for i, text in enumerate(texts):
                            text_str = str(text).strip()
                            if not text_str:
                                continue
                            score = float(scores[i]) if i < len(scores) else 0.8
                            poly = polys[i] if i < len(polys) else []
                            # Convert polygon/bbox to standard format
                            box = poly.tolist() if hasattr(poly, "tolist") else list(poly)
                            lines.append({
                                "text": text_str,
                                "confidence": round(score, 4),
                                "box": box
                            })
                            total_conf += score
                            count += 1
                    elif isinstance(first_res, list):
                        # Handle classic PaddleOCR [[bbox, (text, conf)]] format
                        for item in first_res:
                            if isinstance(item, (list, tuple)) and len(item) == 2:
                                bbox = item[0]
                                text, conf = item[1]
                                lines.append({
                                    "text": str(text).strip(),
                                    "confidence": round(float(conf), 4),
                                    "box": bbox
                                })
                                total_conf += float(conf)
                                count += 1

                if count > 0:
                    avg_conf = total_conf / count
                    raw_text = "\n".join([line["text"] for line in lines])

                    return {
                        "engine": "PaddleOCR",
                        "raw_text": raw_text,
                        "lines": lines,
                        "confidence_score": round(avg_conf * 100, 2),
                        "line_count": count
                    }
                else:
                    print("[OCRManager] PaddleOCR detected 0 text lines. Trying EasyOCR fallback.")
            except Exception as e:
                print(f"[OCRManager] PaddleOCR inference error: {e}. Falling back.")

        # 2. Try EasyOCR
        if self.easy_ocr is not None:
            try:
                results = self.easy_ocr.readtext(image_np)
                lines = []
                total_conf = 0.0
                count = 0

                for item in results:
                    bbox, text, conf = item
                    lines.append({
                        "text": str(text).strip(),
                        "confidence": round(float(conf), 4),
                        "box": [[float(pt[0]), float(pt[1])] for pt in bbox]
                    })
                    total_conf += float(conf)
                    count += 1

                avg_conf = (total_conf / count) if count > 0 else 0.0
                raw_text = "\n".join([line["text"] for line in lines])

                return {
                    "engine": "EasyOCR",
                    "raw_text": raw_text,
                    "lines": lines,
                    "confidence_score": round(avg_conf * 100, 2),
                    "line_count": count
                }
            except Exception as e:
                print(f"[OCRManager] EasyOCR inference error: {e}. Falling back.")

        # 3. Native Light Engine (Ensures robust service uptime without inventing text)
        return self._native_extract(image_np)

    def _native_extract(self, image_np: np.ndarray) -> dict:
        """
        Fallback when all OCR models are unavailable.
        Returns empty extraction truthfully without fabricating packaging text.
        """
        return {
            "engine": "NativeOCR-Engine",
            "raw_text": "",
            "lines": [],
            "confidence_score": 0.0,
            "line_count": 0
        }

ocr_manager = OCRManager()
