import os

PORT = int(os.getenv("AI_SERVICE_PORT", "8000"))
HOST = os.getenv("AI_SERVICE_HOST", "0.0.0.0")

# Image Preprocessing & Blur Thresholds
# Laplacian variance threshold below which an image is considered blurry
BLUR_THRESHOLD = float(os.getenv("BLUR_THRESHOLD", "85.0"))
MIN_IMAGE_DIMENSION = 300
MAX_IMAGE_DIMENSION = 4096

# OCR Configuration
DEFAULT_LANGUAGES = ["en", "hi"]
OCR_ENGINE_PRIMARY = os.getenv("OCR_ENGINE_PRIMARY", "paddleocr")
OCR_CONFIDENCE_THRESHOLD = float(os.getenv("OCR_CONFIDENCE_THRESHOLD", "0.60"))
