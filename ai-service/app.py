import io
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from preprocessing.pipeline import assess_image_quality, preprocess_for_ocr
from ocr.ocr_manager import ocr_manager
import config

app = FastAPI(
    title="LabelMitra AI Microservice",
    description="Computer Vision Preprocessing & Modular OCR Engine for Food Labels",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LabelMitra-AI-Microservice",
        "primary_engine": ocr_manager.primary_engine,
        "blur_threshold": config.BLUR_THRESHOLD,
        "languages": config.DEFAULT_LANGUAGES
    }

async def read_image_from_upload(file: UploadFile) -> np.ndarray:
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from buffer")
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

@app.post("/preprocess")
async def preprocess_endpoint(file: UploadFile = File(...)):
    img_np = await read_image_from_upload(file)
    quality = assess_image_quality(img_np)
    return {
        "success": True,
        "filename": file.filename,
        "quality_metrics": quality
    }

@app.post("/process-pipeline")
async def process_pipeline_endpoint(file: UploadFile = File(...)):
    """
    Executes OpenCV image enhancement, blur/clarity detection, and OCR extraction.
    """
    img_np = await read_image_from_upload(file)
    preprocessed_img, quality_metrics = preprocess_for_ocr(img_np)
    ocr_result = ocr_manager.extract_text(preprocessed_img)

    return {
        "success": True,
        "filename": file.filename,
        "quality_metrics": quality_metrics,
        "ocr_result": ocr_result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=config.HOST, port=config.PORT, reload=True)
