import cv2
import numpy as np
from config import BLUR_THRESHOLD

def assess_image_quality(image_np: np.ndarray) -> dict:
    """
    Evaluates image quality, blur level, and illumination using OpenCV metrics.
    """
    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_np

    # 1. Blur Detection via Variance of the Laplacian
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = laplacian_var < BLUR_THRESHOLD

    # 2. Lighting & Contrast Analysis
    mean_brightness = float(np.mean(gray))
    std_contrast = float(np.std(gray))

    is_too_dark = mean_brightness < 45.0
    is_too_bright = mean_brightness > 230.0
    is_low_contrast = std_contrast < 30.0

    # 3. Overall Clarity Assessment
    quality_status = "OPTIMAL"
    recommendations = []

    if is_blurry:
        quality_status = "BLURRY"
        recommendations.append("Image appears blurry. Consider holding the camera steady.")
    if is_too_dark:
        quality_status = "POOR_LIGHTING"
        recommendations.append("Image is too dark. Increase lighting on package label.")
    if is_too_bright:
        quality_status = "OVEREXPOSED"
        recommendations.append("Glare or overexposure detected on packaging.")
    if is_low_contrast:
        recommendations.append("Low contrast text detected. Contrast enhancement applied.")

    return {
        "blur_score": round(laplacian_var, 2),
        "is_blurry": is_blurry,
        "brightness": round(mean_brightness, 2),
        "contrast": round(std_contrast, 2),
        "quality_status": quality_status,
        "recommendations": recommendations,
        "resolution": {
            "width": int(image_np.shape[1]),
            "height": int(image_np.shape[0])
        }
    }

def preprocess_for_ocr(image_np: np.ndarray) -> tuple[np.ndarray, dict]:
    """
    Applies deterministic computer vision preprocessing pipeline:
    1. Grayscale conversion
    2. Adaptive contrast enhancement (CLAHE)
    3. Bilateral filter for noise reduction with edge preservation
    4. Optional deskewing
    """
    quality_metrics = assess_image_quality(image_np)

    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_np.copy()

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast_enhanced = clahe.apply(gray)

    # Denoise using Bilateral Filter (smoothes flat areas while preserving sharp font boundaries)
    denoised = cv2.bilateralFilter(contrast_enhanced, d=5, sigmaColor=50, sigmaSpace=50)

    # Normalize resolution if excessively large
    max_dim = 2400
    h, w = denoised.shape
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        denoised = cv2.resize(denoised, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    return denoised, quality_metrics
