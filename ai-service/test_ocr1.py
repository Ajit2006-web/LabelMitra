import pathlib, json, requests, os
# Ensure output directory exists
out_dir = pathlib.Path('ocr_results')
out_dir.mkdir(exist_ok=True)
images = ["kurkure.jpg", "nutrition.jpg", "ingredents.jpg", "declarations.jpg"]
for img_name in images:
    img_path = pathlib.Path(img_name)
    if not img_path.is_file():
        print(f"⚠️ Image not found: {img_name}")
        continue
    with open(img_path, "rb") as f:
        files = {"file": (img_path.name, f, "image/jpeg")}
        try:
            resp = requests.post("http://127.0.0.1:8000/process-pipeline", files=files)
            resp.raise_for_status()
            result = resp.json()
            # Save pretty printed JSON per image
            out_file = out_dir / f"{img_path.stem}.json"
            with open(out_file, "w", encoding="utf-8") as jf:
                json.dump(result, jf, ensure_ascii=False, indent=2)
            print(f"✅ Saved result for {img_name} → {out_file}")
        except Exception as e:
            print(f"❌ Failed for {img_name}: {e}")
