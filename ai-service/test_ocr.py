# test_ocr.py  (create in the ai‑service root)
import requests, pathlib, json

img_path = pathlib.Path(r"kurkure.jpg")   # any real label image
with open(img_path, "rb") as f:
    files = {"file": (img_path.name, f, "image/jpeg")}
    resp = requests.post("http://localhost:8000/process-pipeline", files=files)
print(json.dumps(resp.json(), indent=2))
