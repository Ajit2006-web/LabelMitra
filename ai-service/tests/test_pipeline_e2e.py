import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import cv2
import numpy as np
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_blank_or_non_food_image():
    print("\n--- TEST 1: Non-Food / Blank Image ---")
    # Generate a blank/gradient image with no text (e.g. landscape or plain background)
    blank_img = np.full((400, 400, 3), (120, 180, 200), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', blank_img)
    
    response = client.post(
        "/process-pipeline",
        files={"file": ("blank.jpg", buffer.tobytes(), "image/jpeg")}
    )
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    data = response.json()
    ocr = data.get("ocr_result", {})
    
    print(f"Status: {response.status_code}")
    print(f"Engine: {ocr.get('engine')}")
    print(f"Lines extracted: {ocr.get('line_count')}")
    print(f"Confidence: {ocr.get('confidence_score')}")
    print(f"Raw text: '{ocr.get('raw_text')}'")
    
    assert ocr.get("line_count", 0) == 0, "Non-food blank image should have 0 lines extracted"
    assert "biscuit" not in ocr.get("raw_text", "").lower(), "Must NOT return biscuit data!"
    print(">>> TEST 1 PASSED: Truthfully detected 0 text lines, no biscuit hallucination.")

def test_real_food_label_kurkure():
    print("\n--- TEST 2: Genuine Food Label (Kurkure) ---")
    kurkure_path = os.path.join(os.path.dirname(__file__), "..", "kurkure.jpg")
    if not os.path.exists(kurkure_path):
        print(f"File {kurkure_path} not found, skipping.")
        return

    with open(kurkure_path, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/process-pipeline",
        files={"file": ("kurkure.jpg", file_bytes, "image/jpeg")}
    )
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    data = response.json()
    ocr = data.get("ocr_result", {})
    quality = data.get("quality_metrics", {})

    print(f"Status: {response.status_code}")
    print(f"Engine: {ocr.get('engine')}")
    print(f"Lines count: {ocr.get('line_count')}")
    print(f"Confidence score: {ocr.get('confidence_score')}")
    print(f"Blur score: {quality.get('blur_score')}, is_blurry: {quality.get('is_blurry')}")
    print("Sample lines extracted:")
    for line in ocr.get("lines", [])[:5]:
        print(f"  - {line.get('text')} ({line.get('confidence')})")

    assert ocr.get("line_count", 0) > 0, "Kurkure label should have extracted text lines"
    assert "kurkure" in ocr.get("raw_text", "").lower() or "tedhe" in ocr.get("raw_text", "").lower() or ocr.get("line_count") > 10, "Should extract text from Kurkure"
    print(">>> TEST 2 PASSED: Genuine food label extracted successfully!")

if __name__ == "__main__":
    test_blank_or_non_food_image()
    test_real_food_label_kurkure()
