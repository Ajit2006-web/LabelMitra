import sys
sys.stdout.reconfigure(encoding='utf-8')
import pathlib, json, requests, os

# Images placed in the ai-service root folder
images = ["kurkure.jpg", "nutrition.jpg", "ingredents.jpg", "declarations.jpg"]

# Ensure a directory for saved results
results_dir = pathlib.Path('results')
results_dir.mkdir(exist_ok=True)

for img_name in images:
    img_path = pathlib.Path(img_name)
    if not img_path.is_file():
        print(f"Image not found: {img_name}")
        continue
    with open(img_path, "rb") as f:
        files = {"file": (img_path.name, f, "image/jpeg")}
        try:
            resp = requests.post("http://127.0.0.1:8000/process-pipeline", files=files)
            resp.raise_for_status()
            result_json = resp.json()
            # Pretty‑print to console
            print(f"=== {img_name} ===")
            print(json.dumps(result_json, indent=2, ensure_ascii=False))
            # Save to a file for later inspection
            out_path = results_dir / f"{img_path.stem}_result.json"
            with open(out_path, "w", encoding="utf-8") as out_f:
                json.dump(result_json, out_f, ensure_ascii=False, indent=2)
            print(f"Saved result to {out_path}")
        except Exception as e:
            print(f"Failed for {img_name}: {e}")

